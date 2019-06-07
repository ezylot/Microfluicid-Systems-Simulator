package at.ezylot.fluidsimulator.controller;

import at.ezylot.fluidsimulator.dtos.ErrorResponse;
import at.ezylot.fluidsimulator.dtos.LineCoords;
import at.ezylot.fluidsimulator.dtos.ReturnDTO;
import at.jku.iic.droplet.basic.architecture.EndPoint;
import at.jku.iic.droplet.basic.architecture.physical.CloggablePhysicalChannel;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalBiochip;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalBypassChannel;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalChannel;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalEdge;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalPump;
import at.jku.iic.droplet.basic.architecture.physical.PressurePump;
import at.jku.iic.droplet.basic.architecture.physical.VolumetricFlowRatePump;
import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionSequence;
import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionTime;
import at.jku.iic.droplet.basic.injection.physical.PhysicalPayloadInjectionTime;
import at.jku.iic.droplet.basic.physics.FluidProperties;
import at.jku.iic.droplet.electric.simulator.PhysicalSimulator;
import at.jku.iic.droplet.electric.simulator.state.PhysicalSystemState;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
public class MainApiController {
    private final MessageSource messageSource;

    public MainApiController(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    @PostMapping("/simulate")
    public ResponseEntity simulate(@RequestBody JsonNode body) {
        Optional<ErrorResponse> errors = validateNodeCounts(body);
        if(errors.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(errors.get());
        }

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
                Map.Entry::getKey,
                o -> new EndPoint<>(o.getValue())
            ));

        Map<Integer, PhysicalPump> pumps = new HashMap<>();

        List<EndPoint<PhysicalEdge>> groundNodes = new ArrayList<>();
        for (final JsonNode pumpToCheck : body.get("pumps")) {
            if (pumpToCheck.get("type").asText().equals("drain")) {
                groundNodes.add(eP.get(new AbstractMap.SimpleEntry<>(pumpToCheck.get("left").asText(), pumpToCheck.get("top").asText())));
            }
        }

        if (groundNodes.size() == 0) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                new ErrorResponse(
                    "error",
                    messageSource.getMessage("simulation-error.no-ground", new String[]{}, LocaleContextHolder.getLocale())
                )
            );
        }

        if (groundNodes.size() == body.get("pumps").size()) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(
                new ErrorResponse(
                    "error",
                    messageSource.getMessage("simulation-error.only-ground", new String[]{}, LocaleContextHolder.getLocale())
                )
            );
        }

        for (final JsonNode pump : body.get("pumps")) {
            String type = pump.get("type").asText();
            if(type.equals("pressure")) {
                pumps.put(
                    pump.get("id").asInt(),
                    new PressurePump(
                        eP.get(new AbstractMap.SimpleEntry<>(pump.get("left").asText(), pump.get("top").asText())),
                        groundNodes.get(0),
                        pump.get("pumpName").asText(),
                        pump.get("pumpValue").asDouble()
                    )
                );
            } else if(type.equals("volume")) {
                pumps.put(
                    pump.get("id").asInt(),
                    new VolumetricFlowRatePump(
                        eP.get(new AbstractMap.SimpleEntry<>(pump.get("left").asText(), pump.get("top").asText())),
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
            switch (channelType) {
                case "normal":
                    edge = new PhysicalChannel(
                        startEp,
                        endEp,
                        "c" + idCounter.toString(),
                        newWidth,
                        newHeight,
                        length
                    );
                    break;
                case "cloggable":
                    edge = new CloggablePhysicalChannel(
                        startEp,
                        endEp,
                        "c" + idCounter.toString(),
                        newWidth,
                        newHeight,
                        length
                    );
                    break;
                case "bypass":
                    edge = new PhysicalBypassChannel(
                        startEp,
                        endEp,
                        "c" + idCounter.toString(),
                        newWidth,
                        newHeight,
                        length
                    );
                    break;
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

        List<ReturnDTO> returnStateDTOs = states.stream()
            .map(ReturnDTO::new)
            .peek(returnDTO -> returnDTO.getDropletStates().forEach(physicalDropletStateDTO -> {
                physicalDropletStateDTO.getDropletPositions().forEach(dropletPositionDTO -> {
                    LineCoords lineCoords = channelNameEndPointMap.get(dropletPositionDTO.getEdgeName());
                    dropletPositionDTO.setEdge(lineCoords);
                });
            }))
            .collect(Collectors.toList());

        return ResponseEntity.ok(returnStateDTOs);
    }

    private Optional<ErrorResponse> validateNodeCounts(JsonNode body) {
        if(body.get("canvas").get("lines").size() == 0) {
            return Optional.of(new ErrorResponse("error", messageSource.getMessage("simulation-error.no-channel", new String[]{}, LocaleContextHolder.getLocale())));
        }

        if(body.get("pumps").size() < 2) {
            return Optional.of(new ErrorResponse("error", messageSource.getMessage("simulation-error.too-few-pumps", new String[]{}, LocaleContextHolder.getLocale())));
        }

        if(body.get("fluids").size() == 0) {
            return Optional.of(new ErrorResponse("error", messageSource.getMessage("simulation-error.no-fluids", new String[]{}, LocaleContextHolder.getLocale())));
        }

        if(body.get("phaseProperties").size() != 4) {
            return Optional.of(new ErrorResponse("error", messageSource.getMessage("simulation-error.phase-properties-empty", new String[]{}, LocaleContextHolder.getLocale())));
        }

        if(body.get("droplets").size() == 0) {
            return Optional.of(new ErrorResponse("error", messageSource.getMessage("simulation-error.no-droplets", new String[]{}, LocaleContextHolder.getLocale())));
        }

        if(body.get("dropletInjections").size() == 0) {
            return Optional.of(new ErrorResponse("error", messageSource.getMessage("simulation-error.no-injections", new String[]{}, LocaleContextHolder.getLocale())));
        }

        return Optional.empty();
    }

    private static class FluidDTO {
        Integer id;
        String name;
        Double mu;
        Double density;

        FluidDTO(Integer id, String name, Double mu, Double density) {
            this.id = id;
            this.name = name;
            this.mu = mu;
            this.density = density;
        }
    }

    private static class DropletDTO {
        Integer id;
        String name;
        Double volume;

        DropletDTO(Integer id, String name, Double volume) {
            this.id = id;
            this.name = name;
            this.volume = volume;
        }
    }
}

