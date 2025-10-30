import * as vscode from 'vscode';

class EndpointItem extends vscode.TreeItem {
	constructor(
		public readonly label: string,
		public readonly collapsibleState: vscode.TreeItemCollapsibleState,
		public readonly context: 'controller' | 'method' | 'other' = 'other',
		public readonly meta?: any
	) {
		super(label, collapsibleState);
		if (this.context === 'method') {
			this.iconPath = new vscode.ThemeIcon('symbol-method');
		} else if (this.context === 'controller') {
			this.iconPath = new vscode.ThemeIcon('symbol-class');
		}
	}
}

export class EndpointProvider implements vscode.TreeDataProvider<EndpointItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<EndpointItem | undefined> = new vscode.EventEmitter<EndpointItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<EndpointItem | undefined> = this._onDidChangeTreeData.event;

	private controllers: Array<any> = [];

	constructor() {}

	refresh(): void {
		this._onDidChangeTreeData.fire(undefined);
	}

	/** Update provider data with extractor result */
	public updateFromExtractor(result: any) {
		// extractor may return { results: [ { controller: { className, methods: [...] } }, ... ] }
		try {
			const controllers: any[] = [];
			if (!result) {
				this.controllers = [];
				this.refresh();
				return;
			}

			if (Array.isArray(result.results)) {
				for (const r of result.results) {
					if (r.controller) controllers.push(r.controller);
				}
			} else if (Array.isArray(result.controllers)) {
				result.controllers.forEach((c: any) => controllers.push(c));
			}

			this.controllers = controllers;
		} catch (e) {
			console.error('Failed to update EndpointProvider', e);
			this.controllers = [];
		} finally {
			this.refresh();
		}
	}

	getTreeItem(element: EndpointItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: EndpointItem): Thenable<EndpointItem[]> {
		if (!element) {
			// Root level - return controllers
			if (this.controllers.length === 0) {
				return Promise.resolve([new EndpointItem('No endpoints', vscode.TreeItemCollapsibleState.None)]);
			}

			const items = this.controllers.map(c => {
				const label = c.className || c.name || 'Controller';
				return new EndpointItem(label, vscode.TreeItemCollapsibleState.Collapsed, 'controller', c);
			});
			return Promise.resolve(items);
		}

		// If element is a controller, return its methods
		if (element.context === 'controller' && element.meta && Array.isArray(element.meta.methods)) {
			const methods = element.meta.methods.map((m: any) => {
				const label = m.methodName || (m.httpMethod ? `${m.httpMethod} ${m.path || ''}` : 'method');
				return new EndpointItem(label, vscode.TreeItemCollapsibleState.None, 'method', m);
			});
			return Promise.resolve(methods);
		}

		return Promise.resolve([]);
	}
}

