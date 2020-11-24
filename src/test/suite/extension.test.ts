import * as assert from 'assert';
import * as path from 'path';
import * as SecHubModel from '../../model/sechubModel';


// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Smoke test', () => {
		assert.strictEqual("works", "works");
	});

	test('SecHub test report file can be loaded and contains job uuid', () => {
		/* execute */
		let model = SecHubModel.loadFromFile(resolveFileLocation("test_sechub_report-1.json"));
		
		/* test */
		assert.strictEqual("061234c8-40aa-4dcf-81f8-7bb8f723b780", model.jobUUID);

	});

	test('SecHub test report file can be loaded and contains 277 findings', () => {
		/* execute */
		let model = SecHubModel.loadFromFile(resolveFileLocation("test_sechub_report-1.json"));
		
		/* test */
		let findings = model.result.findings;
		
		assert.strictEqual(277,findings.length);


	});

	test('SecHub test report file can be loaded and contains medium finding with id3', () => {
		/* execute */
		let model = SecHubModel.loadFromFile(resolveFileLocation("test_sechub_report-1.json"));
		
		/* test */
		let findings = model.result.findings;
		let firstFinding = findings[0];
		assert.strictEqual(3, firstFinding.id);
		assert.strictEqual(SecHubModel.Severity.medium, firstFinding.severity);

		let codeCallstack1 = firstFinding.code;
		assert.strictEqual(82,codeCallstack1?.line);		
		assert.strictEqual(65,codeCallstack1?.column);		
		assert.strictEqual("input",codeCallstack1?.relevantPart);		

		let codeCallstack2 = codeCallstack1?.calls;
		assert.strictEqual("whiteList",codeCallstack2?.relevantPart);		

	});
});

function resolveFileLocation(testfile:string): string{
	let testReportLocation = path.dirname(__filename)+"/../../../src/test/suite/"+testfile;
	return testReportLocation;
}
