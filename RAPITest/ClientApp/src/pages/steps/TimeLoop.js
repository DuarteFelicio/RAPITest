﻿import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';
import { Row, Col, Figure } from 'react-bootstrap'
import Form from 'react-bootstrap/Form';
import RadioComp from '../../components/RadioComp'
import { warningMessage } from '../../components/AlertComp'
import { AwesomeButton } from "react-awesome-button";
import "react-awesome-button/dist/styles.css";
import loopIcon from '../../assets/loop.webp'
import backIcon from '../../assets/back.png'
import finishIcon from '../../assets/finish.png'

export class TimeLoop extends Component {

    constructor() {

        super()

        this.state = {
            runimmediately: true,
            selectedRadioLabel: "1 hour",
            radioButtons: [],
            group: "group1",
            showWarning: false,
            rungenerated: true
        }

        this.finalizeCallback = this.finalizeCallback.bind(this)
        this.changeSelectedRadio = this.changeSelectedRadio.bind(this)
        this.handleCheck = this.handleCheck.bind(this)
        this.closeWarning = this.closeWarning.bind(this)
        this.handleCheckGenerated = this.handleCheckGenerated.bind(this)
    }

    componentDidMount() {
        let button1H = {
            defaultChecked: true,
            id: "radio1H",
            label: "1 hour",
            callback: this.changeSelectedRadio,
            callbackValue: "1 hour"
        }
        let button12H = {
            defaultChecked: false,
            id: "radio12H",
            label: "12 hours",
            callback: this.changeSelectedRadio,
            callbackValue: "12 hours"
        }
        let button24H = {
            defaultChecked: false,
            id: "radio24H",
            label: "24 hours",
            callback: this.changeSelectedRadio,
            callbackValue: "24 hours"
        }
        let button1W = {
            defaultChecked: false,
            id: "radio1W",
            label: "1 week",
            callback: this.changeSelectedRadio,
            callbackValue: "1 week"
        }
        let buttonNever = {
            defaultChecked: false,
            id: "radioNever",
            label: "Never",
            callback: this.changeSelectedRadio,
            callbackValue: "Never"
        }
        this.setState({ radioButtons: [button1H, button12H, button24H, button1W, buttonNever] })
    }

    finalizeCallback() {
        if (this.state.selectedRadioLabel === "Never" && !this.state.runimmediately) {
            this.setState({ showWarning: true })
            return
        }
        let ret = {
            runimmediately: this.state.runimmediately,
            interval: this.state.selectedRadioLabel,
            rungenerated: this.state.rungenerated
        }
        this.props.handlerTime(ret)
    }

    changeSelectedRadio(newRadio) {
        this.setState({ selectedRadioLabel: newRadio })
    }

    handleCheck() {
        let newrun = !this.state.runimmediately
        this.setState({ runimmediately: newrun })
    }

    handleCheckGenerated() {
        let newrun = !this.state.rungenerated
        this.setState({ rungenerated: newrun })
    }

    closeWarning() {
        this.setState({ showWarning: false })
    }

    render() {
        let isEmpty = this.props.tslFiles === null
        return (
            <div>
                <Row>
                    {this.state.showWarning ? warningMessage("Please select either run immediately or one of the intervals", this.closeWarning) : <div></div>}
                </Row>
                <Row>
                    <Col sm={4}>
                        <Form>
                            <div style={{ fontSize:"20px" }} key={`checkbox`} className="mb-3">
                                <Form.Check
                                    defaultChecked
                                    type={'checkbox'}
                                    id={`testImmediately`}
                                    label={`Run tests immediately after this?`}
                                    onChange={this.handleCheck}
                                />
                                <Form.Check
                                    disabled={isEmpty}
                                    defaultChecked
                                    type={'checkbox'}
                                    id={`runGenerated`}
                                    label={`Run generated tests?`}
                                    onChange={this.handleCheckGenerated}
                                />
                                <div style={{ fontSize: "25px", padding: "30px 0px 30px 0px", fontWeight:"bold" }}>Run tests every:</div>
                                <RadioComp
                                    group={this.state.group}
                                    radioButtons={this.state.radioButtons}
                                />
                            </div>
                        </Form>
                        <div style={{ textAlign: "center" }}>
                            <AwesomeButton type="primary" onPress={this.finalizeCallback}><img style={{ marginRight: "10px" }} width="30" height="30" src={finishIcon} alt="Logo" />Finalize</AwesomeButton>
                        </div>
                    </Col>
                    <Col sm={8}>
                        <Figure style={{ padding: "100px 0px 0px 250px" }}>
                            <Figure.Image
                                width={400}
                                height={400}
                                alt="400x400"
                                src={loopIcon}
                            />
                            <Figure.Caption>
                            </Figure.Caption>
                        </Figure>
                    </Col>
                </Row>
                <div style={{ marginTop: '50px' }}>
                    <AwesomeButton type="primary" onPress={this.props.goBack}><img style={{ marginRight: "15px" }} width="50" height="50" src={backIcon} alt="Logo" />Go Back</AwesomeButton>
                </div>
            </div>
        )
    }
}