package at.ezylot.fluidsimulator.controller;

import at.jku.iic.droplet.basic.architecture.EndPoint;
import at.jku.iic.droplet.basic.architecture.physical.CloggablePhysicalChannel;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalBiochip;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalChannel;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalEdge;
import at.jku.iic.droplet.basic.architecture.physical.PhysicalPump;
import at.jku.iic.droplet.basic.architecture.physical.PressurePump;
import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionSequence;
import at.jku.iic.droplet.basic.injection.physical.PhysicalDropletInjectionTime;
import at.jku.iic.droplet.basic.injection.physical.PhysicalPayloadInjectionTime;
import at.jku.iic.droplet.basic.physics.FluidProperties;
import at.jku.iic.droplet.electric.simulator.PhysicalSimulator;
import at.jku.iic.droplet.electric.simulator.state.PhysicalSystemState;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

@RestController
public class MainApiController {

    private static ArrayList<EndPoint<PhysicalEdge>> getEndPoints(int amount, int startIdx) {

        ArrayList<EndPoint<PhysicalEdge>> endPoints = new ArrayList<>(amount);
        for (int i = 0; i < amount; i++) {
            endPoints.add(new EndPoint<>(startIdx + i + 1));
        }
        return endPoints;
    }


    @GetMapping("/simulate")
    public List<PhysicalSystemState> simulate(HttpServletRequest request) {
        final double width = 100e-06;
        final double widthSmall = 30e-06;
        final double height = 53e-06;

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
        double dropletVolume = width * 2 * height * width;
        FluidProperties waterInOilDropletProperties = FluidProperties.getWaterInOilDropletProperties();
        PhysicalBiochip chip = new PhysicalBiochip(edges, Collections.singletonList(p1), waterInOilDropletProperties, dropletVolume, dropletVolume);

        List<PhysicalDropletInjectionTime> waterDropletInjections = Collections
            .singletonList(new PhysicalPayloadInjectionTime(p1, 0, chip.payloadDropletVolume));

        PhysicalSimulator simulator = new PhysicalSimulator(chip, new PhysicalDropletInjectionSequence(waterDropletInjections));
        List<PhysicalSystemState> states = simulator.simulate(0.0001, true);

        return states;
    }
}
