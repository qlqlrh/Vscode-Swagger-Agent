import * as vscode from 'vscode';
import { AnalyzerService } from './analyzer/analyzerService';
import { EndpointProvider } from './views/endpointProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Swagger Agent is now active');

    // Initialize services
    const endpointProvider = new EndpointProvider();
    const analyzerService = new AnalyzerService(endpointProvider);

    // Register views
    vscode.window.registerTreeDataProvider('swagger-agent-endpoints', endpointProvider);

    // Register commands
    let analyzeCommand = vscode.commands.registerCommand('swagger-agent.analyze', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            analyzerService.analyzeFile(editor.document);
        }
    });

    let generateCommand = vscode.commands.registerCommand('swagger-agent.generateAnnotations', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            analyzerService.generateAnnotations(editor.document);
        }
    });

    // File watcher for auto-analysis
    if (vscode.workspace.getConfiguration('swagger-agent').get('autoAnalyze')) {
        let watcher = vscode.workspace.createFileSystemWatcher('**/*.java');
        watcher.onDidChange(uri => {
            const document = vscode.workspace.textDocuments.find(doc => doc.uri.toString() === uri.toString());
            if (document) {
                analyzerService.analyzeFile(document);
            }
        });
        context.subscriptions.push(watcher);
    }

    context.subscriptions.push(analyzeCommand, generateCommand);
}

export function deactivate() {}