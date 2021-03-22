import * as vscode from 'vscode';
import * as sechubExtension from './../extension';
import { HierarchyItem } from './../provider/secHubCallHierarchyTreeDataProvider';

export function hookShowInEditorAction(context: sechubExtension.SecHubContext) {
	let callBack = (hierarchyItem: HierarchyItem) => {
		if (hierarchyItem instanceof HierarchyItem) {
			console.log("show in editor called");
			var element = hierarchyItem.callstackElement;
			var result = context.fileLocationExplorer.searchFor(element.location);
			if (result.size === 0) {
				console.log("No result found for " + element.location);
				return;
			}
			var fileLocation = result.values().next().value;
			console.log("File location:" + fileLocation);

			var startPos = new vscode.Position(element.line, element.column);
			var endPos = new vscode.Position(element.line, element.column + element.relevantPart.length);

			var selectionRange = new vscode.Range(startPos, endPos);
			var openDocumentCallback = (doc: vscode.TextDocument) => {
				vscode.window.showTextDocument(doc, { selection: selectionRange });
			};
			var uri = vscode.Uri.file(fileLocation);
			vscode.workspace.openTextDocument(uri).then(openDocumentCallback);
		}
	};

	let selectEditorCommandDisposable = vscode.commands.registerCommand('sechubCallHierarchyView.selectNode', callBack);
	context.extensionContext.subscriptions.push(selectEditorCommandDisposable);
}
