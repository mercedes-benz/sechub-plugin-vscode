import * as vscode from 'vscode';
import * as sechubExtension from './../extension';
import * as secHubModel from './../model/sechubModel';
import { FindingNodeReportItem, ReportItem, SecHubReportTreeDataProvider } from './../provider/secHubReportTreeDataProvider';



export function hookShowCallHierarchyAction(context: sechubExtension.SecHubContext) {
	let showCallHierarchyCallBack = (reportItem: ReportItem) => {
		if (reportItem instanceof FindingNodeReportItem) {
			context.callHierarchyTreeDataProvider.update(reportItem.findingNode);
		}
	};

	let showCallHierarchyCommandDisposable = vscode.commands.registerCommand('sechubReportView.showCallHierarchyEntry', showCallHierarchyCallBack);
	context.extensionContext.subscriptions.push(showCallHierarchyCommandDisposable);

	let selectCallHierarchyCommandDisposable = vscode.commands.registerCommand("sechubReportView.selectNode", showCallHierarchyCallBack);
	context.extensionContext.subscriptions.push(selectCallHierarchyCommandDisposable);

}
