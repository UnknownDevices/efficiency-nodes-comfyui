import { app } from "../../scripts/app.js";

// Latest versions by node. Only nodes that have undergone breaking changes at some point get versioned
const nodeLatestVersions = {
    "XY Plot": 1,
};

// Update handlers by version by node. Each handler updates a node with data from the previous version to the said version
const nodeUpdaterHandlers = {
    "XY Plot": {
        1: updateXYPlotToV1,
    },
};

// Update handlers do two things:
// - On previously existing widgets that were repositioned, assign the widget value found in the outdated position to the new position
// - On non previously exiting widgets, assign the default widget value for that widget

// XY Plot Handlers
function updateXYPlotToV1(nodeData) {
    const updatedValues = [
        nodeData.widgets_values[3],
        nodeData.widgets_values[4],
        "#FFFFFF",
        "#000000",
        nodeData.widgets_values[1],
        nodeData.widgets_values[2],
        "Table",
        nodeData.widgets_values[0],
        0,
    ];
    nodeData.widgets_values = updatedValues;
}

// Update data of nodes not at their latest version
function nodeUpdaterLogic(nodeData) {
    // Get updater handlers and latest version for this node
    const handlers = nodeUpdaterHandlers[nodeData.type];
    const latestVersion = nodeLatestVersions[nodeData.type];
    if (!handlers || !latestVersion) return;
    
    // Call the handler to update the node to the next version until we've updated to the latest version
    for (let i = (nodeData.properties?.["Version"] ?? 0) + 1; i <= latestVersion; i++) {
        handlers[i]?.(nodeData);
    }
}

// Set the version of newly created nodes to their latest
function nodeVersionerLogic(node) {
    const latestVersion = nodeLatestVersions[node.getTitle()];
    if (latestVersion) {
        node.addProperty("Version", latestVersion, "number");
    }
}

app.registerExtension({
    name: "efficiency.nodeversioner",
    init(app) {
        // Intercept the loading of a graph for fixing the data of nodes from outdated workflows before any node is created
        const loadGraphData = app.loadGraphData;
        app.loadGraphData = function (graphData) {
            // Normally, if a graph data isn't provided the default graph is loaded, but since the default graph doesn't contain any of our nodes, we're not interested
            for (let nodeData of graphData?.nodes) {
                nodeUpdaterLogic(nodeData);
            }

            return loadGraphData?.apply(this, arguments);
        };
    },
    nodeCreated(node) {
        nodeVersionerLogic(node);
    },
});
