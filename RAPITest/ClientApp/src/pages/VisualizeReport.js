﻿import React, { Component } from 'react';
import authService from './api-authorization/AuthorizeService'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import Overview from './VisualizeReportTabs/Overview'
import GeneratedTests from './VisualizeReportTabs/GeneratedTests'
import TSLWorkflows from './VisualizeReportTabs/TSLWorkflows'
import { Row, Col, Table } from 'react-bootstrap'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Xarrow from "react-xarrows";
import 'react-tabs/style/react-tabs.css';
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import HttpRequestInfoComp from '../components/HttpRequestInfoComp'

const boxStyle = { border: "grey solid 2px", borderRadius: "10px", padding: "5px" };

export class VisualizeReport extends Component {

    static displayName = VisualizeReport.name;

    constructor(props) {
        super(props)
        this.state = {
            apiTitle: "Report",
            allReportsOriginal: null,
            allReportsUIFriendly: null,
            errors: 0,
            warnings: 0,
            workflows: null,
            date: null,
            generatedTests: null,
            missingTests: null,
            barChartData: null,
            pieChartData: null,
            totalCompletionTime: 0,
            fullWorkflows: null,
            openSidePanel: false,
            sidePanelInfo: {},
            stressTestData: null,
            stressTestColumns: null
        }

        this.setupReport = this.setupReport.bind(this)
        this.showSidePanelDetails = this.showSidePanelDetails.bind(this)
        this.showSidePanel = this.showSidePanel.bind(this)
    }

    async componentDidMount() {
        const token = await authService.getAccessToken();
        let apiId = this.props.match.params.apiId
        
        fetch(`MonitorTest/ReturnReport?apiId=${apiId}`, {
            method: 'GET',
            headers: !token ? {} : { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json())
            .then(resp => {
                resp.report = JSON.parse(resp.report)
                this.setupReport(resp)
            })

    }

    setupReport(report) {
        console.log(report)
        let newDates = [];

        report.allReportDates.forEach((element, index) => {
            newDates.push(this.showTime(element))
        });

        report.report.date = this.showTime(report.report.date)


        let piedata = [];
        piedata.push({ name: 'Total Errors', value: report.report.Errors })

        let bardata = [];

        let totalsuccesses = 0;
        let totalCompletionTime = 0;

        let fullWorkflows = []

        let stressTestData = []
        let stressTestColumns = []

        report.report.WorkflowResults.forEach((workflow, workflowindex) => {

            let thisWorkflow = []

            let workflowStressData = []
            let workflowStressColumns = []

            let workflowId = workflow.WorkflowID
            let workflowTotalTime = 0

            let currentWorkflow = []
            currentWorkflow.push({ displayName: workflowId, id: workflowId, targetId: [] })
            thisWorkflow.push(currentWorkflow)

            workflow.Tests.forEach((test, testindex) => {

                workflowStressColumns.push(test.TestID)

                let currentTest = []
                currentTest.push({ displayName: test.TestID, id: test.TestID, targetId: [] })

                test.TestResults.forEach((testresult, testresultindex) => {
                    currentTest.push({ displayName: testresult.TestName, id: test.TestID + testresult.TestName, targetId: [], success: testresult.Success })
                    if (testresult.Success) totalsuccesses++;
                })
                thisWorkflow.push(currentTest)

                totalCompletionTime += test.RequestMetadata.ResponseTime
                workflowTotalTime += test.RequestMetadata.ResponseTime

                if (test.StressTimes != null) {
                    test.StressTimes.forEach((time, testresultindex) => {
                        totalCompletionTime += time;
                        workflowTotalTime += time

                        if (workflowStressData[testresultindex] !== undefined) {
                            let aux = workflowStressData[testresultindex]
                            aux[test.TestID] = time
                        }
                        else {
                            let newAux = {}
                            newAux.name = testresultindex
                            newAux[test.TestID] = time
                            workflowStressData.push(newAux)
                        }
                    })
                }

            })

            stressTestColumns.push(workflowStressColumns)
            stressTestData.push(workflowStressData)
            fullWorkflows.push(thisWorkflow)
            bardata.push({ name: workflowId, Total_Time: workflowTotalTime })
        })

        console.log(stressTestColumns)

        this.setupCircleTree(fullWorkflows)

        let generatedTestsCompletionTime = 0

        report.report.GeneratedTests.forEach((generatedTest, workflowindex) => {
            generatedTest.TestResults.forEach((testresult, testresultindex) => {
                if (testresult.Success) totalsuccesses++;
            })
            generatedTestsCompletionTime += generatedTest.RequestMetadata.ResponseTime
            totalCompletionTime += generatedTest.RequestMetadata.ResponseTime
        })

        bardata.push({ name: 'GeneratedTests', Total_Time: generatedTestsCompletionTime })
        piedata.push({ name: 'Total Successes', value: totalsuccesses })
        

        this.setState({
            apiTitle: report.apiName,
            allReportsOriginal: report.allReportDates,
            allReportsUIFriendly: newDates,
            errors: report.report.Errors,
            warnings: report.report.Warnings,
            workflows: report.report.WorkflowResults,
            date: report.report.date,
            generatedTests: report.report.GeneratedTests,
            missingTests: report.report.MissingTests,
            pieChartData: piedata,
            barChartData: bardata,
            totalCompletionTime: totalCompletionTime,
            fullWorkflows: fullWorkflows,
            stressTestData: stressTestData,
            stressTestColumns: stressTestColumns
        })
    }

    showSidePanel(id,workflowIndex,testIndex) {
        let information = {}

        if (workflowIndex === 0) {
            this.state.workflows.forEach((workflow, wi) => {
                if (id === workflow.WorkflowID) {
                    information.workflow = workflow
                    information.title = id
                    information.subtitle = "Workflow Details"
                }
            })
        }
        else {
            if (testIndex === 0) {
                this.state.workflows.forEach((workflow, wi) => {
                    workflow.Tests.forEach((test, ti) => {
                        if (id.includes(test.TestID)) {
                            information.test = test
                            information.title = id
                            information.subtitle = "Test Details"
                        }
                    })
                })
            }
            else {
                this.state.workflows.forEach((workflow, wi) => {
                    workflow.Tests.forEach((test, ti) => {
                        if (id.includes(test.TestID)) {
                            let target = id.substring(test.TestID.length, id.length)
                            test.TestResults.forEach((result, ri) => {
                                if (target === result.TestName) {
                                    information.verification = result
                                    information.title = result.TestName
                                    information.subtitle = "Verification Details"
                                }
                            })
                        }
                    })
                }) 
            }
        }

        this.setState({
            openSidePanel: true,
            sidePanelInfo: information
        })
    }

    showSidePanelDetails() {
        console.log(this.state.sidePanelInfo)
        console.log(this.state.sidePanelInfo.workflow)
        if (this.state.sidePanelInfo.workflow !== undefined) {
            return <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Tests</th>
                        <th># Successes</th>
                        <th># Errors</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.sidePanelInfo.workflow.Tests.map((test, i) => {
                        let nErrors = 0
                        let nSuccesses = 0

                        test.TestResults.forEach((r, i) => {
                            if (r.Success) {
                                nSuccesses++
                            }
                            else {
                                nErrors++
                            }
                        })

                        return (
                            <tr>
                                <td>{test.TestID}</td>
                                <td>{nSuccesses}</td>
                                <td>{nErrors}</td>
                            </tr>
                        )
                        
                    })}
                </tbody>
            </Table>
        }
        if (this.state.sidePanelInfo.test !== undefined) {
            let myTest = this.state.sidePanelInfo.test

            return <HttpRequestInfoComp
                Method={myTest.RequestMetadata.Method}
                URI={myTest.RequestMetadata.URI}
                requestHeaders={myTest.Headers}
                requestBody={myTest.Body}
                code={myTest.RequestMetadata.ResponseCode}
                responseHeaders={myTest.RequestMetadata.ResponseHeaders}
                responseBody={myTest.RequestMetadata.ResponseBody}
                responseTime={myTest.RequestMetadata.ResponseTime}
            />
        }
        if (this.state.sidePanelInfo.verification !== undefined) {
            return <Table striped bordered hover>
                <tbody>
                    <tr>
                        <td>Success</td>
                        <td>{this.state.sidePanelInfo.verification.Success ? "true" : "false"}</td>
                    </tr>
                    <tr>
                        <td>Description</td>
                        <td>{this.state.sidePanelInfo.verification.Description}</td>
                    </tr>
                </tbody>
            </Table>
        }
    }

    setupCircleTree(fullWorkflows) {
        fullWorkflows.forEach((workflow, workflowindex) => {
            for (var i = 0; i < workflow.length; i++) {
                if (i + 1 !== workflow.length) {
                    workflow[i][0].targetId.push(workflow[i + 1][0].id)
                }
                let TestList = workflow[i]
                for (var k = 0; k < TestList.length; k++) {
                    if (k + 1 !== TestList.length) {
                        TestList[k].targetId.push(TestList[k + 1].id)
                    }
                }
            }
        })
    }

    showTime(value) {
        if (value === null) return 0
        let time = value.split('T')
        let date = time[0]
        let hours = time[1].split('.')[0]

        return date + " " + hours
    }

    showRender() {
        console.log(this.state)
        return (
            <div>
                <Row>
                    <Col>
                        <h1>{this.state.apiTitle}</h1>
                    </Col>
                    <Col>
                        <h1>{this.state.date}</h1>
                    </Col>
                </Row>
                <Row style={{ paddingTop:"10px" }}>
                    <Tabs id='myTabsID'>
                        <TabList>
                            <Tab>Overview</Tab>
                            <Tab>TSL Workflows</Tab>
                            <Tab>Generated Tests</Tab>
                        </TabList>
                        <TabPanel>
                            <Overview
                                errors={this.state.errors}
                                warnings={this.state.warnings}
                                workflows={this.state.workflows}
                                generatedTests={this.state.generatedTests}
                                totalCompletionTime={this.state.totalCompletionTime}
                                pieChartData={this.state.pieChartData}
                                barChartData={this.state.barChartData}
                            />
                        </TabPanel>
                        <TabPanel>
                            <TSLWorkflows
                                fullWorkflows={this.state.fullWorkflows}
                                clickableFunction={this.showSidePanel}
                                stressTestData={this.state.stressTestData}
                                stressTestColumns={this.state.stressTestColumns}
                            />
                        </TabPanel>
                        <TabPanel>
                            <GeneratedTests

                            />
                        </TabPanel>
                    </Tabs>
                </Row>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.state.date !== null && this.showRender()}
                <SlidingPane
                    isOpen={this.state.openSidePanel}
                    title={this.state.sidePanelInfo.title}
                    subtitle={this.state.sidePanelInfo.subtitle}
                    width="40%"
                    onRequestClose={() => {
                        // triggered on "<" on left top click or on outside click
                        this.setState({
                            openSidePanel: false,
                            sidePanelInfo: {},
                        });
                    }}
                >
                    <div>{this.showSidePanelDetails()}</div>
                </SlidingPane>
            </div>
        )
    }
}

/**/