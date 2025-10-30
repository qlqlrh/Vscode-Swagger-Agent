import * as vscode from 'vscode';

export class EndpointProvider implements vscode.TreeDataProvider<EndpointItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<EndpointItem | undefined | null | void> = new vscode.EventEmitter<EndpointItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<EndpointItem | undefined | null | void> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: EndpointItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: EndpointItem): Thenable<EndpointItem[]> {
        if (!element) {
            // Root level - return controllers
            return Promise.resolve([
                new EndpointItem('Loading...', vscode.TreeItemCollapsibleState.None)
            ]);
        }
        return Promise.resolve([]);
    }
}

class EndpointItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
    }
}