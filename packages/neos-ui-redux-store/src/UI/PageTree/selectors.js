import {$get} from 'plow-js';
import {createSelector} from 'reselect';

import {selectors as nodes} from '../../CR/Nodes/index';

const getActive = $get('ui.contentCanvas.contextPath');
const getFocused = $get('ui.pageTree.isFocused');
const getUncollapsed = $get('ui.pageTree.uncollapsed');
const getLoading = $get('ui.pageTree.loading');
const getErrors = $get('ui.pageTree.errors');

export const getFocusedNodeContextPathSelector = createSelector(
    [
        getFocused
    ],
    focusedNodeContextPath => focusedNodeContextPath
);

//
// TODO: NODETYPE REFACTORING - Fix calls of this
//
export const getTreeNodeSelector = createSelector(
    [
        getActive,
        getFocused,
        getUncollapsed,
        getLoading,
        getErrors,
        state => state
    ],
    (
        activeNodeContextPath,
        focusedNodeContextPath,
        uncollapsedNodeContextPaths,
        loadingNodeContextPaths,
        errorNodeContextPaths,
        state
    ) => (contextPath, nodeTypeFilter = []) => {
        //
        // Try to grab the node
        //
        const node = nodes.byContextPathSelector(contextPath)(state);

        //
        // Check if the requested node is existent and has the correct node type
        //
        if (node && (!nodeTypeFilter.length || nodeTypeFilter.indexOf(node.nodeType) !== -1)) {
            //
            // Check for valid child nodes
            //
            const validChildren = $get('children', node).filter(({nodeType}) =>
                !nodeTypeFilter.length || nodeTypeFilter.indexOf(nodeType) !== -1
            );

            const contextPath = $get('contextPath', node);
            //
            // Turn the node into a data structure, that can be consumed by a tree view
            //
            return {
                contextPath,
                label: $get('label', node),
                uri: $get('uri', node),
                isActive: contextPath === activeNodeContextPath,
                isFocused: contextPath === focusedNodeContextPath,
                isCollapsed: !uncollapsedNodeContextPaths.contains(contextPath),
                isLoading: loadingNodeContextPaths.contains(contextPath),
                hasError: errorNodeContextPaths.contains(contextPath),
                hasChildren: validChildren.length > 0,
                children: validChildren.map(node => $get('contextPath', node))
            };
        }

        return null;
    }
);
