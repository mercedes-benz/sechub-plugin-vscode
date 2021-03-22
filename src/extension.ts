// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from 'path';
import * as vscode from 'vscode';
import * as reportViewActions from './action/reportViewActions';
import * as callHierarchyViewActions from './action/callHierarchyViewActions';
import * as importActions from './action/importActions';
import { FileLocationExplorer } from './fileLocationExplorer';
import * as secHubModel from './model/sechubModel';
import { HierarchyItem, SecHubCallHierarchyTreeDataProvider } from './provider/secHubCallHierarchyTreeDataProvider';
import { ReportItem, SecHubReportTreeDataProvider } from './provider/secHubReportTreeDataProvider';

export function activate(context: vscode.ExtensionContext) {
	console.log('SecHub plugin activation requested.');

	/* TODO de-jcup: let's load test data at the moment for development , but must be removed later */
	let loadTestData: boolean = true;
	let initialFindingModel = undefined;
	if (loadTestData) {
		initialFindingModel = secHubModel.loadFromFile(resolveFileLocation("test_sechub_report-1.json"));
	}

	let secHubContext: SecHubContext = new SecHubContext(initialFindingModel, context);

	buildReportView(secHubContext);
	buildCallHierarchyView(secHubContext);

	hookActions(secHubContext);

	console.log('SecHub plugin has been activated.');
}

function buildReportView(context: SecHubContext) {
	vscode.window.createTreeView('sechubReportView', {
		treeDataProvider: context.reportTreeProvider
	});
}

function buildCallHierarchyView(context: SecHubContext) {
	context.callHierarchyView = vscode.window.createTreeView('sechubCallHierarchyView', {
		treeDataProvider: context.callHierarchyTreeDataProvider
	});
}

function hookActions(context: SecHubContext) {
	importActions.hookImportAction(context);
	reportViewActions.hookShowCallHierarchyAction(context);
	callHierarchyViewActions.hookShowInEditorAction(context);
}


export class SecHubContext {
	callHierarchyView: vscode.TreeView<HierarchyItem> | undefined = undefined;
	reportView: vscode.TreeView<ReportItem> | undefined = undefined;

	callHierarchyTreeDataProvider: SecHubCallHierarchyTreeDataProvider;
	reportTreeProvider: SecHubReportTreeDataProvider;
	findingModel: secHubModel.FindingModel | undefined;
	extensionContext: vscode.ExtensionContext;
	fileLocationExplorer: FileLocationExplorer;

	constructor(findingModel: secHubModel.FindingModel | undefined, extensionContext: vscode.ExtensionContext,
	) {
		this.reportTreeProvider = new SecHubReportTreeDataProvider(findingModel);
		this.callHierarchyTreeDataProvider = new SecHubCallHierarchyTreeDataProvider(undefined);
		this.extensionContext = extensionContext;
		this.fileLocationExplorer = new FileLocationExplorer();

		/* setup search folders for explorer */
		let workspaceFolders = vscode.workspace.workspaceFolders; // get the open folder path
		workspaceFolders?.forEach((workspaceFolder) => {
			this.fileLocationExplorer.searchFolders.add(workspaceFolder.uri.fsPath);
		});

	}
}

export function deactivate() { }

function resolveFileLocation(testfile: string): string {
	let testReportLocation = path.dirname(__filename) + "/../src/test/suite/" + testfile;
	return testReportLocation;
}
