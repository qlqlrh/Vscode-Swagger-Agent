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

    // Dev helper: load sample extractor JSON into the EndpointProvider (for testing without running full analyze)
    let devLoadSample = vscode.commands.registerCommand('swagger-agent.devLoadSample', async () => {
        try {
            const wf = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
            if (!wf) {
                vscode.window.showErrorMessage('워크스페이스가 열려있지 않습니다');
                return;
            }
            const samplePath = vscode.Uri.joinPath(wf.uri, 'src', 'sample', 'out', 'endpoints.json');
            const bytes = await vscode.workspace.fs.readFile(samplePath);
            const text = Buffer.from(bytes).toString('utf8');
            const json = JSON.parse(text);
            endpointProvider.updateFromExtractor(json);
            vscode.window.showInformationMessage('샘플 데이터를 사이드바에 로드했습니다');
        } catch (e: any) {
            console.error('Dev load sample failed', e);
            vscode.window.showErrorMessage('샘플 로드 실패: ' + (e.message || String(e)));
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

    context.subscriptions.push(analyzeCommand, generateCommand, devLoadSample);
}

export function deactivate() {}