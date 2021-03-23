import * as vscode from 'vscode';
import * as sechubExtension from './../extension';
import * as secHubModel from './../model/sechubModel';
import { HierarchyItem } from './../provider/secHubCallHierarchyTreeDataProvider';

export function hookSelectNodeAction(context: sechubExtension.SecHubContext) {
	let callBack = (hierarchyItem: HierarchyItem) => {
		if (hierarchyItem instanceof HierarchyItem) {
			console.log("show in editor called");
			var element = hierarchyItem.callstackElement;

			openInEditor(context, element);
			showInInfoView(context, hierarchyItem.findingNode, element);
		}
	};

	// register and make disposable
	let selectEditorCommandDisposable = vscode.commands.registerCommand('sechubCallHierarchyView.selectNode', callBack);
	context.extensionContext.subscriptions.push(selectEditorCommandDisposable);
}


function showInInfoView(context: sechubExtension.SecHubContext, findingNode: secHubModel.FindingNode|undefined, element: secHubModel.CodeCallStackElement) {
	context.infoTreeProvider.update(findingNode,element);
}


function openInEditor(context: sechubExtension.SecHubContext, element: secHubModel.CodeCallStackElement) {
	var result = context.fileLocationExplorer.searchFor(element.location);
	if (result.size === 0) {
		console.log("No result found for " + element.location);
		return;
	}
	var fileLocation = result.values().next().value;
	console.log("File location:" + fileLocation);

	var startPos = new vscode.Position(element.line-1, element.column-1);
	var endPos = new vscode.Position(element.line-1, element.column-1 + element.relevantPart.length);

	var selectionRange = new vscode.Range(startPos, endPos);
	var openDocumentCallback = (doc: vscode.TextDocument) => {
		vscode.window.showTextDocument(doc, { selection: selectionRange });
	};
	var uri = vscode.Uri.file(fileLocation);
	vscode.workspace.openTextDocument(uri).then(openDocumentCallback);
}
