﻿import React, { Component } from 'react'
import { Table } from 'react-bootstrap'
import ReactReadMoreReadLess from "react-read-more-read-less";
import './HttpRequestInfoComp.css';

export default class HttpRequestInfoComp extends Component {
    render() {

        let Method = this.props.Method
        let URI = this.props.URI
        let requestHeaders = this.props.requestHeaders
        let requestBody = this.props.requestBody

        let code = this.props.code
        let responseHeaders = this.props.responseHeaders
        let responseBody = this.props.responseBody
        let responseTime = this.props.responseTime

        let headersString = ""

        responseHeaders.$values.forEach((o, i) => {
            headersString += o.Key + " : "
            o.Value.$values.forEach((k, j) => {
                headersString += k + " "
            })
            headersString += " ; "
        })
        
        return (
            <div>
                <h2>Request</h2>
                <Table striped bordered hover>
                    <tbody>
                        <tr>
                            <td>Method</td>
                            <td>{Method}</td>
                        </tr>
                        <tr>
                            <td>URI</td>
                            <td>{URI}</td>
                        </tr>
                        <tr>
                            <td>Headers</td>
                            <td>{JSON.stringify(requestHeaders)}</td>
                        </tr>
                        <tr>
                            <td>Body</td>
                            <td><pre>{requestBody}</pre></td>
                        </tr>
                    </tbody>
                </Table>
                <h2>Response</h2>
                <Table striped bordered hover>
                    <tbody>
                        <tr>
                            <td>Code</td>
                            <td>{code}</td>
                        </tr>
                        <tr>
                            <td>Body</td>
                            <td>
                                <pre>
                                    <ReactReadMoreReadLess
                                        charLimit={400}
                                        readMoreText={"Read more ▼"}
                                        readLessText={"Read less ▲"}
                                        readMoreClassName="read-more-less--more"
                                        readLessClassName="read-more-less--more"
                                    >
                                        {responseBody === null ? "" : responseBody}
                                    </ReactReadMoreReadLess>
                                </pre>
                            </td>
                        </tr>
                        <tr>
                            <td>Headers</td>
                            <td>{headersString}</td>
                        </tr>
                        <tr>
                            <td>Time (ms)</td>
                            <td>{responseTime}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        )
    }
}