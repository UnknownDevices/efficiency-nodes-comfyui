import { app } from "../../scripts/app.js";

// Latest versions by node. Only nodes that have undergone breaking changes at some point get versioned
const nodeLatestVersions = {
    "XY Plot": 1,
}

// Update handlers by version by node. Each handler updates a node from the previous version to the said version
const nodeUpdaterHandlers = {
	"XY Plot": {
        1: updateXYPlotToV1,
    }
};

/* 
    Update handlers do two things:
    - On previously existing widgets that were repositioned, assign the widget value found in the outdated position to the new position
    - On non previously exiting widgets, assign the default widget value for that widget
*/

// XY Plot Handlers
function updateXYPlotToV1(node) {
    node.widgets[0].value = node.widgets_values[3];
    node.widgets[1].value = node.widgets_values[4];
    node.widgets[2].value = "#FFFFFF";
    node.widgets[3].value = "#000000";
    node.widgets[4].value = node.widgets_values[1];
    node.widgets[5].value = node.widgets_values[2];
    node.widgets[6].value = "Table";
    node.widgets[7].value = node.widgets_values[0];
    node.widgets[8].value = 0;
}

// Update any nodes not at their latest version
function nodeUpdaterLogic(node) {
    // Get updater handlers and latest version for this node
    const title = node.getTitle();
    const handlers = nodeUpdaterHandlers[title];
    const latestVersion = nodeLatestVersions[title];
    if (!handlers || !latestVersion) return;
    
    // Create version property if it doesn't exist
    if (node.properties?.["Version"] == null) {
		node.addProperty("Version", 0, "number");
	}

    // Call the handler to update the node to the next version until we've updated to the latest version
    for (let i = node.properties["Version"] + 1; i <= latestVersion; i++) {
        handlers[i]?.(node);
    }

    // Set node version to latest updated version
	node.properties["Version"] = version;
}

// Add a version property to newly created nodes
function nodeVersionerLogic(node) {
    const latestVersion = nodeLatestVersions[node.getTitle()]
    if (latestVersion) {
        node.addProperty("Version", latestVersion, "number")
    }
}

app.registerExtension({
	name: "efficiency.nodeversioner",
	loadedGraphNode(node) {
        nodeUpdaterLogic(node);
	},
    nodeCreated(node) {
        nodeVersionerLogic(node)
    },
});
