// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SecHubCallHierarchyTreeDataProvider } from './provider/secHubCallHierarchyTreeDataProvider';
import { HierarchyItem } from './provider/secHubCallHierarchyTreeDataProvider';

import { FindingNodeReportItem, SecHubReportTreeDataProvider } from './provider/secHubReportTreeDataProvider';
import { ReportItem } from './provider/secHubReportTreeDataProvider';

import * as secHubModel from './model/sechubModel';
import * as path from 'path';
import { report } from 'process';


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
	hookImportAction(context);
	hookShowCallHierarchyAction(context);
}

function hookImportAction(context: SecHubContext) {
	let importReportFileCommandDisposable = vscode.commands.registerCommand('sechubReportView.importReportFile', () => {

		const options: vscode.OpenDialogOptions = {

			title: "Import SecHub report file",
			canSelectMany: false,
			openLabel: 'Open',
			filters: {
				'SecHub report files': ['json'],
				'All files': ['*']
			}
		};

		vscode.window.showOpenDialog(options).then(fileUri => {
			if (fileUri && fileUri[0]) {
				let filePath = fileUri[0].fsPath;

				vscode.window.showInformationMessage('Started SecHub report import...');
				console.log('Selected file: ' + filePath);

				let findingModel = secHubModel.loadFromFile(filePath);
				context.reportTreeProvider.update(findingModel);
				context.findingModel = findingModel;
			}
		});
	});

	context.extensionContext.subscriptions.push(importReportFileCommandDisposable);
}

function hookShowCallHierarchyAction(context: SecHubContext) {
	let showCallHierarchyCommandDisposable = vscode.commands.registerCommand('sechubReportView.showCallHierarchyEntry', 
		(reportItem: ReportItem) => {
		if (reportItem instanceof FindingNodeReportItem) {
			context.callHierarchyTreeDataProvider.update(reportItem.findingNode);
		}
	});
	context.extensionContext.subscriptions.push(showCallHierarchyCommandDisposable);
}

class SecHubContext {
	callHierarchyView: vscode.TreeView<HierarchyItem> | undefined = undefined;
	reportView: vscode.TreeView<ReportItem> | undefined = undefined;

	callHierarchyTreeDataProvider: SecHubCallHierarchyTreeDataProvider;
	reportTreeProvider: SecHubReportTreeDataProvider;
	findingModel: secHubModel.FindingModel | undefined;
	extensionContext: vscode.ExtensionContext;

	constructor(findingModel: secHubModel.FindingModel | undefined, extensionContext: vscode.ExtensionContext,
	) {
		this.reportTreeProvider = new SecHubReportTreeDataProvider(findingModel);
		this.callHierarchyTreeDataProvider = new SecHubCallHierarchyTreeDataProvider(undefined);
		this.extensionContext = extensionContext;
	}
}

export function deactivate() { }

function resolveFileLocation(testfile: string): string {
	let testReportLocation = path.dirname(__filename) + "/../src/test/suite/" + testfile;
	return testReportLocation;
}
