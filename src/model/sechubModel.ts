export enum TrafficLight {
    red = "RED",
    yellow = "YELLOW",
    green = "GREEN",
}

export enum Severity {
    info = "INFO",
    unclassified = "UNCLASSIFIED",
    low = "LOW",
    medium = "MEDIUM",
    high = "HIGH",
    critical = "CRITICAL",
}

export function loadFromFile(location: string): FindingModel {

    var fs = require('fs');
    var obj = JSON.parse(fs.readFileSync(location, 'utf8'));

    let model: FindingModel = obj;

    return model;

}

export interface FindingModel {
    jobUUID: string
    trafficLight: string
    result: FindingResult
}

export interface FindingResult{
    count: number
    findings : FindingNode[]
}

export interface FindingNode {
    id: number
    name: string
    severity: Severity

    cweId?: number

    code?: CodeCallStackElement
}

export interface CodeCallStackElement{
    
    line: number
    column: number
    
    location: string
    
    source: string
    relevantPart: string
    
    calls?: CodeCallStackElement

}

