//Author-Autodesk Inc.
//Description-Etract BOM information from active design.
/*globals adsk*/
(function () {

    "use strict";

    if (adsk.debug === true) {
        /*jslint debug: true*/
        debugger;
        /*jslint debug: false*/
    }

    var ui;
    try {
        
        var app = adsk.core.Application.get();
        ui = app.userInterface;
        
        var design = adsk.fusion.Design(app.activeProduct);
        var title = 'Extract BOM';
        if (!design) {
            ui.messageBox('No active design', title);
            adsk.terminate();
            return;
        }
        
        // Get all occurrences in the root component of the active design
        var root = design.rootComponent;
        var occs = root.allOccurrences;
        
        // Gather information about each unique component
        var count = occs.count;
        var i, j, k;
        var bom = [];
        for (i = 0;i < count;++i) {
            var comp = occs.item(i).component;
            for (j = 0;j < bom.length;++j) {
                if (bom[j].component.equals(comp)) {
                    // Increment the instance count of the existing row.
                    bom[j].instances += 1;
                    break;
                }
            }
            if (j === bom.length) {
                // Gather any BOM worthy values from the component
                var volume = 0;
                var bodies = comp.bRepBodies;
                for (k = 0;k < bodies.count;++k) {
                    volume += bodies.item(k).volume;
                }
                
                // Add this component to the BOM
                bom.push({
                    component: comp,
                    name: comp.name,
                    instances: 1,
                    volume: volume
                });
            }
        }
        
        // Display the BOM
        var spacePadRight = function (value, len) {
            var pad = '';
            if (len > value.length) {
                pad = Array(len - value.length + 1).join(' ');
            }
            return value + pad;
        };
        
        var title = spacePadRight('Name', 25) + spacePadRight('Instances', 15) + 'Volume\n';
        var msg = bom.reduce(function(previous, current) {
            return previous + '\n' + spacePadRight(current.name, 25) + spacePadRight(current.instances.toString(), 15) + current.volume;
        }, title);
        
        ui.messageBox(msg, 'Bill Of Materials');
    } 
    catch(e) {
        if (ui) {
            ui.messageBox('Failed : ' + (e.description ? e.description : e));
        }
    }

    adsk.terminate();
}());
