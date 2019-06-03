package at.ezylot.fluidsimulator.controller;

import at.ezylot.fluidsimulator.dtos.LineCoords;
import at.ezylot.fluidsimulator.dtos.ReturnDTO;
import at.jku.iic.droplet.basic.architecture.Edge;
import at.jku.iic.droplet.basic.architecture.EndPoint;
import at.jku.iic.droplet.basic.architecture.physical.*;
import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionSequence;
import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionTime;
import at.jku.iic.droplet.basic.injection.physical.PhysicalPayloadInjectionTime;
import at.jku.iic.droplet.basic.physics.FluidProperties;
import at.jku.iic.droplet.electric.simulator.PhysicalSimulator;
import at.jku.iic.droplet.electric.simulator.state.PhysicalDropletState;
import at.jku.iic.droplet.electric.simulator.state.PhysicalSystemState;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class MainApiController {

    private static ArrayList<EndPoint<PhysicalEdge>> getEndPoints(int amount, int startIdx) {

        ArrayList<EndPoint<PhysicalEdge>> endPoints = new ArrayList<>(amount);
        for (int i = 0; i < amount; i++) {
            endPoints.add(new EndPoint<>(startIdx + i + 1));
        }
        return endPoints;
    }

    @PostMapping("/simulateOld")
    public List<PhysicalSystemState> simulateOld() {
        final double width = 100e-06;
        final double height = 53e-06;
        final double widthSmall = 30e-06;
        double dropletVolume = width * 2 * height * width;

        ArrayList<EndPoint<PhysicalEdge>> eP = getEndPoints(4, 0);

        PhysicalPump p1 = new PressurePump(eP.get(0), eP.get(2), "p1", 3000);

        // Input channel
        PhysicalChannel c1 = new PhysicalChannel(eP.get(0), eP.get(1), "c1", width, height, 3 * width);
        PhysicalChannel c2 = new PhysicalChannel(eP.get(1), eP.get(2), "c2", width, height, 3 * width);

        CloggablePhysicalChannel c3 = new CloggablePhysicalChannel(eP.get(1), eP.get(3), "c3", height, widthSmall, width);
        CloggablePhysicalChannel c4 = new CloggablePhysicalChannel(eP.get(3), eP.get(2), "c4", height, widthSmall, width);

        List<PhysicalEdge> edges = new LinkedList<>();
        edges.add(c1);
        edges.add(c2);
        edges.add(c3);
        edges.add(c4);

        // The droplet length is 2 times the default channel width
        FluidProperties waterInOilDropletProperties = FluidProperties.getWaterInOilDropletProperties();
        PhysicalBiochip chip = new PhysicalBiochip(edges, Collections.singletonList(p1), waterInOilDropletProperties, dropletVolume, dropletVolume);

        List<PhysicalDropletInjectionTime> waterDropletInjections = Collections
            .singletonList(new PhysicalPayloadInjectionTime(p1, 0, chip.payloadDropletVolume));

        PhysicalSimulator simulator = new PhysicalSimulator(chip, new PhysicalDropletInjectionSequence(waterDropletInjections));
        List<PhysicalSystemState> states = simulator.simulate(0.0001, true);

        return states;
    }


    @PostMapping("/simulate")
    public List<ReturnDTO> simulate(@RequestBody JsonNode body) throws IOException {
        Map<AbstractMap.SimpleEntry<String, String>, Integer> corners = new HashMap<>();
        Integer idCounter = 1;
        for (final JsonNode line : body.get("canvas").get("lines")) {
            AbstractMap.SimpleEntry<String, String> first = new AbstractMap.SimpleEntry<>(line.get("x1").asText(), line.get("y1").asText());
            AbstractMap.SimpleEntry<String, String> second = new AbstractMap.SimpleEntry<>(line.get("x2").asText(), line.get("y2").asText());
            if(!corners.containsKey(first)) {
                corners.put(first, idCounter++);
            }

            if(!corners.containsKey(second)) {
                corners.put(second, idCounter++);
            }
        }

        Map<AbstractMap.SimpleEntry<String, String>, EndPoint<PhysicalEdge>> eP = corners.entrySet().stream()
            .collect(Collectors.toMap(
                o -> o.getKey(),
                o -> new EndPoint<>(o.getValue())
            ));

        Map<Integer, PhysicalPump> pumps = new HashMap<>();

        List<EndPoint<PhysicalEdge>> groundNodes = new ArrayList<>();
        for (final JsonNode pumpToCheck : body.get("pumps")) {
            if (pumpToCheck.get("type").asText().equals("drain")) {
                groundNodes.add(eP.get(new AbstractMap.SimpleEntry(pumpToCheck.get("left").asText(), pumpToCheck.get("top").asText())));
            }
        }

        for (final JsonNode pump : body.get("pumps")) {
            String type = pump.get("type").asText();
            if(type.equals("pressure")) {
                pumps.put(
                    pump.get("id").asInt(),
                    new PressurePump(
                        eP.get(new AbstractMap.SimpleEntry(pump.get("left").asText(), pump.get("top").asText())),
                        groundNodes.get(0),
                        pump.get("pumpName").asText(),
                        pump.get("pumpValue").asDouble()
                    )
                );
            } else if(type.equals("volume")) {
                pumps.put(
                    pump.get("id").asInt(),
                    new VolumetricFlowRatePump(
                        eP.get(new AbstractMap.SimpleEntry(pump.get("left").asText(), pump.get("top").asText())),
                        groundNodes.get(0),
                        pump.get("pumpName").asText(),
                        pump.get("pumpValue").asDouble()
                    )
                );
            }
        }

        List<PhysicalEdge> edges = new LinkedList<>();
        Map<String, LineCoords> channelNameEndPointMap = new HashMap<>();
        idCounter = 1;
        for (final JsonNode line : body.get("canvas").get("lines")) {
            AbstractMap.SimpleEntry<String, String> start = new AbstractMap.SimpleEntry<>(line.get("x1").asText(), line.get("y1").asText());
            AbstractMap.SimpleEntry<String, String> end = new AbstractMap.SimpleEntry<>(line.get("x2").asText(), line.get("y2").asText());

            channelNameEndPointMap.put("c" + idCounter.toString(), new LineCoords(
                line.get("x1").asDouble(),
                line.get("x2").asDouble(),
                line.get("y1").asDouble(),
                line.get("y2").asDouble()
            ));

            EndPoint<PhysicalEdge> startEp = eP.get(start);
            EndPoint<PhysicalEdge> endEp = eP.get(end);

            if(!startEp.equals(groundNodes.get(0)) && groundNodes.contains(startEp)) {
                startEp = groundNodes.get(0);
            }

            if(!endEp.equals(groundNodes.get(0)) && groundNodes.contains(endEp)) {
                endEp = groundNodes.get(0);
            }

            String channelType = line.get("channelType").asText();
            Double newHeight = line.get("properties").get("height").asDouble() * 1E-6;
            Double newWidth = line.get("properties").get("width").asDouble() * 1E-6;

            Double part1 = Double.parseDouble(start.getKey()) - Double.parseDouble(end.getKey());
            Double part2 = Double.parseDouble(start.getValue()) - Double.parseDouble(end.getValue());
            Double length = Math.sqrt(Math.pow(part1, 2) + Math.pow(part2, 2)) * 1E-6;

            newWidth = newWidth * 10;
            newHeight = newHeight * 10;
            length = length * 10;

            PhysicalEdge edge = null;
            if(channelType.equals("normal")) {
                edge = new PhysicalChannel(
                    startEp,
                    endEp,
                    "c" + idCounter.toString(),
                    newWidth,
                    newHeight,
                    length
                );
            } else if(channelType.equals("cloggable")) {
                edge = new CloggablePhysicalChannel(
                    startEp,
                    endEp,
                    "c" + idCounter.toString(),
                    newWidth,
                    newHeight,
                    length
                );
            } else if(channelType.equals("bypass")) {
                edge = new PhysicalBypassChannel(
                    startEp,
                    endEp,
                    "c" + idCounter.toString(),
                    newWidth,
                    newHeight,
                    length
                );
            }
            edges.add(edge);
            idCounter++;
        }

        Map<Integer, FluidDTO> fluidDTOMap = new HashMap<>();
        for (final JsonNode fluid : body.get("fluids")) {
            fluidDTOMap.put(fluid.get("id").asInt(), new FluidDTO(
                fluid.get("id").asInt(),
                fluid.get("name").asText(),
                fluid.get("mu").asDouble(),
                fluid.get("densityC").asDouble()
            ));
        }

        FluidDTO contPhaseFluid = fluidDTOMap.get(body.get("phaseProperties").get("contPhaseFluid").asInt());
        FluidDTO disptPhaseFluid = fluidDTOMap.get(body.get("phaseProperties").get("disptPhaseFluid").asInt());

        FluidProperties fluidCombination = new FluidProperties(
            contPhaseFluid.mu,
            disptPhaseFluid.mu,
            contPhaseFluid.density,
            body.get("phaseProperties").get("interfactialTension").asDouble(),
            body.get("phaseProperties").get("slip").asDouble()
        );

        PhysicalBiochip chip = new PhysicalBiochip(
            edges,
            new ArrayList<>(pumps.values()),
            fluidCombination,
            0.0, // TODO: check if we set it here or per droplet
            0.0 // TODO: check if we set it here or per droplet
        );

        Map<Integer, DropletDTO> dropletDTOMap = new HashMap<>();
        for (final JsonNode droplet : body.get("droplets")) {
            dropletDTOMap.put(droplet.get("id").asInt(), new DropletDTO(
                droplet.get("id").asInt(),
                droplet.get("name").asText(),
                droplet.get("volume").asDouble()
            ));
        }

        List<PhysicalDropletInjectionTime> injections = new ArrayList<>();
        for (final JsonNode injection : body.get("dropletInjections")) {
            int injectionPumpId = injection.get("injectionPumpId").asInt();
            double injectionTime = injection.get("injectionTime").asDouble();
            int dropletId = injection.get("dropletId").asInt();
            DropletDTO dropletDTO = dropletDTOMap.get(dropletId);

            PhysicalPayloadInjectionTime i = new PhysicalPayloadInjectionTime(
                pumps.get(injectionPumpId),
                injectionTime,
                dropletDTO.volume
            );
            injections.add(i);
        }

        PhysicalSimulator simulator = new PhysicalSimulator(chip, new PhysicalDropletInjectionSequence(injections));
        List<PhysicalSystemState> states = simulator.simulate(0.0001, true);

        return states.stream()
            .map(ReturnDTO::new)
            .peek(returnDTO -> returnDTO.getDropletStates().forEach(physicalDropletStateDTO -> {
                physicalDropletStateDTO.getDropletPositions().forEach(dropletPositionDTO -> {
                    LineCoords lineCoords = channelNameEndPointMap.get(dropletPositionDTO.getEdgeName());
                    dropletPositionDTO.setEdge(lineCoords);
                });
            }))
            .collect(Collectors.toList());
    }

    private static class FluidDTO {
        public Integer id;
        public String name;
        public Double mu;
        public Double density;

        public FluidDTO(Integer id, String name, Double mu, Double density) {
            this.id = id;
            this.name = name;
            this.mu = mu;
            this.density = density;
        }
    }

    private static class DropletDTO {
        public Integer id;
        public String name;
        public Double volume;

        public DropletDTO(Integer id, String name, Double volume) {
            this.id = id;
            this.name = name;
            this.volume = volume;
        }
    }
}


