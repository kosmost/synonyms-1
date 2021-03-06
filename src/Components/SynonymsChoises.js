import React, { Component } from 'react';
import { graphqlOperation } from "aws-amplify";
import { Connect } from "aws-amplify-react";
import { Auth } from 'aws-amplify';


import * as queries from '../graphql/queries';
import * as mutations from '../graphql/mutations'
// import * as subscriptions from './graphql/subscriptions';

import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import { Button, Jumbotron, Form, Col, Row, Container, ButtonGroup, Fade } from 'react-bootstrap';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { QUESTION_CONTENTS, QUESTION_TITLES } from '../consts/Const';
import { Pie } from 'react-chartjs-2';

import { getFormatedDate, getFormatedTime, randomsort } from './Utilities';

class SynonymsChoises extends Component {
    constructor(props) {
        super(props);
        this.state = {
            session: 0,
            part: 0,
            items: [],
            results: [],
            currentIndex: 0,
            selectedOption: '',
            firstTime: true,
            username: '',
            sendHistory: null,
            addSpacedRepetition: null,
            buttonText: 'Submit'
        };
      }

    handleOptionChange = changeEvent => {
        this.setState({
            selectedOption: changeEvent.target.value
        });
    }

    handleRedoSession = () => {
        this.state.results.fill('-');
        for (let index = 0; index < this.state.items.length; index ++) {
            this.shuffleItemAnswers (index);
        }
        this.setState({
            currentIndex: 0,
            selectedOption: '',
            firstTime: false
        });
    }

    // async 
    async addHistory (sendHistory, tryNum) {
        const currentItem = this.state.items[this.state.currentIndex];
        const date = new Date();
     
        const input = {
         //   id: this.state.username + yyyy + mm + dd + hh + mi + ss + this.state.session + this.state.part + tryNum,
            username: this.state.username,
            result: this.state.selectedOption === currentItem.Answer,
            tryNum: tryNum,
            answer: this.state.selectedOption,
            itemId: currentItem.id,
            sessionId: currentItem.session,
            partId: currentItem.type,
            index: currentItem.index,
            date: getFormatedDate(date),
            time: getFormatedTime(date),
            genre: 'lesson'
        }
    
        try {
            // console.log (input);
            await sendHistory({input})
        } catch (err) {
            console.error(err);
        }
    }

    async addToSpacedRepetition (addSpacedRepetition) {
        const currentItem = this.state.items[this.state.currentIndex];
        const today = new Date();
        let tomorrow = new Date(today);
        console.log ("today:", today);
        console.log ("tomorrow:", tomorrow);

        tomorrow.setDate(tomorrow.getDate() + 1);
     
        const input = {
         //   id: this.state.username + yyyy + mm + dd + hh + mi + ss + this.state.session + this.state.part + tryNum,
            username: this.state.username,
            contentId: currentItem.id,
            date: getFormatedDate(tomorrow),
            stageIdx: 0, // initial value for SRS item, SRS will update that later
            times: 0 // initial value for SRS item
        }
    
        try {
            // console.log ("add to SRS:", input);
            await addSpacedRepetition({input})
        } catch (err) {
            console.error(err);
        }
    }

    handleSubmit = () => {
        let currentItem = this.state.items[this.state.currentIndex];

        if (this.state.buttonText === 'Next') {
            // clear state
            this.setState({
                selectedOption: '',
                buttonText: 'Submit'
            });
            // move to next item
            this.setState({ currentIndex: this.state.currentIndex + 1 });
        }
        // the user made choise / selected one of the radio input
        else if (this.state.selectedOption.length > 0 ) {
            this.setState({ buttonText: 'Next' });
            this.state.results[this.state.currentIndex] =
                (this.state.selectedOption === currentItem.Answer);
            if (this.state.firstTime === true) {
                this.addHistory (this.state.sendHistory, 1);
                if (this.state.selectedOption !== currentItem.Answer) 
                    this.addToSpacedRepetition (this.state.addSpacedRepetition);
            }
            else 
                this.addHistory (this.state.sendHistory, 2)
        }
        //console.log("You have submitted:", this.state.selectedOption);
    }

    shuffleItemAnswers(index) {
        let currentItem = this.state.items[index];
        let choises = [currentItem.A, currentItem.B, currentItem.C, currentItem.D, currentItem.E];
        // random the choises list sequence
        choises.sort(randomsort);    
        this.state.items[index].A = choises[0];
        this.state.items[index].B = choises[1];
        this.state.items[index].C = choises[2];
        this.state.items[index].D = choises[3];
        this.state.items[index].E = choises[4];
    }
    
    componentDidMount() {
            const {session, part} = this.props.match.params;
            this.setState({session: session, part: part});

            Auth.currentAuthenticatedUser({
                bypassCache: false  
            }).then(user => {
                this.setState({username: user.username});
            });

            //todo: search backend whether is first time testing today
    }

    render() {
        //console.log ('session:', this.state.session, ' part:', this.state.part);

        if (this.state.session === 0)
            return(<Container> Loading </Container>);

        const Hint = () => {

            if (this.state.items.length > 0) {
                let currentItem = this.state.items[this.state.currentIndex];

                if (this.state.buttonText.localeCompare ('Next') === 0) {
                    let open = true;
                    if (this.state.selectedOption !== currentItem.Answer) 
                        return (<Fade in={open}>
                            <div id='hint'> <p className="text-danger">Not correct! </p> {currentItem.Hint} <br /></div>
                        </Fade>);
                    else
                        return (<Fade in={open}>
                            <div id='hint'> Correct! <br /></div>
                        </Fade>);
                }
            }
            return (<Fade in={false}><div id='hint'></div></Fade>)
        } 

        const ChoisesDisplay = () => {
            let currentItem = this.state.items[this.state.currentIndex];
            let choises = [currentItem.A, currentItem.B, currentItem.C, currentItem.D, currentItem.E];

            return (
                <fieldset>
                    <Form.Group as={Row}>
                    <Col sm={10}>
                    { choises.map (choise => <Form.Check 
                                            type="radio"
                                            label={choise}
                                            name="answer"
                                            id={choise} 
                                            value={choise}
                                            onChange={this.handleOptionChange}
                                            checked={this.state.selectedOption === choise}
                                            key={choise}
                                            disabled={this.state.buttonText.localeCompare('Next') === 0} />)}
                    </Col>
                    </Form.Group>
                </fieldset>
            );
        }

        const ListView = () => {
            let currentItem = this.state.items[this.state.currentIndex];
            if (this.state.items.length > 0) {
                return (
                    <Jumbotron>
                        <h5> {QUESTION_CONTENTS[this.state.part-1]} </h5>
                        <br />
                        <h3> {currentItem.base} </h3>
                        <br />
                        <ChoisesDisplay />
                    </Jumbotron>
                );
            }
            return (<div></div>);
        }

        const ResultBar = () => {
            return (
                <div className="bg-light" style={{display: "block"}}>
                <ButtonGroup>
                    { this.state.results.map ((result, index) => <Button
                                                                  variant={result === '-' ?
                                                                           'secondary' :
                                                                           result === true ?
                                                                           'success' : 'danger'}
                                                                  size="sm"
                                                                  key={index}
                                                                  className="mr-1"
                                                                  >
                                                                    {index+1}
                                                                  </Button>) }
                </ButtonGroup>
                </div>
            )
        }

        const ResultPie = () => {

            let data = {
                labels: [
                    'Correct',
                    'Wrong'
                ],
                datasets: [{
                    data: [0,0],
                    backgroundColor: [
                    '#36A2EB',
                    '#FF6384'
                    ],
                    hoverBackgroundColor: [
                    '#36A2EB',
                    '#FF6384'
                    ]
                }]
            };

            let amountTrue = 0;
            for (let i = 0; i < this.state.results.length; i++) {
              if (this.state.results[i] === true) 
                amountTrue ++;
            }

            data.datasets[0].data[0] = amountTrue;
            data.datasets[0].data[1] = this.state.results.length - amountTrue;

            return (
                <Container>
                    <h4 className="text-center">You've finished Session {this.state.session} Part {this.state.part}</h4>
                    <Pie data={data} />
                    <Row>
                        <Col></Col>
                        <Col>
                        <ul>
                        <li>Correct: {amountTrue}</li>
                        <li>Wrong: {this.state.results.length - amountTrue}</li>
                        </ul>
                        </Col>
                        <Col></Col>
                    </Row>
                    <Row>
                        <Col className="col"></Col>
                        <Col className="col">
                        <Button onClick={this.handleRedoSession}>
                            Retry
                        </Button>
                        </Col>
                        <Col className="col"></Col>
                        <Col className="col">
                        <Button as={Link} to="/">
                            Back
                        </Button>
                        </Col>
                    </Row>
                </Container>
            );
        }

        const Question = () => {
            return (
                <Container>
                    <ResultBar />
                    {/* Brand Title */}
                    <div className="text-white bg-dark px-2">
                        Lesson {this.state.session} - {QUESTION_TITLES[this.state.part-1]}
                    </div>

                    <ListView />
                    {/* float button to right */}
                            <Row>
                             <Col>
                             <Hint />
                             </Col>
                             <Col>
                                <div style={{display: "flex"}}>
                                <Button 
                                    style={{ marginLeft: "auto" }} 
                                    id="submit" 
                                    onClick={() => this.handleSubmit()}> 
                                    { this.state.buttonText } 
                                </Button>
                                </div>
                            </Col>
                            </Row>
                </Container>
            );
        }

        // Data already retrieved, show questions or result summary
        if (this.state.items.length > 0) {
            if (this.state.currentIndex >= this.state.items.length) {
                return (<ResultPie />);
            }
            return (<Question />);
        }

        // No data, retrieve it first. 
        return (
            <div>
                <Connect query={graphqlOperation(queries.listSynonyms, 
                                    {"filter": { session: { eq: this.state.session},
                                                type: { eq: this.state.part.toString()}},
                                                limit: 5000})}>
                    {({ data: { listSynonyms }, loading, errors }) => {
                    if (loading || !listSynonyms) return (<h3>Loading...</h3>);
                        if (errors.lenth > 0 ) return (<h3>Error</h3>);

                        this.state.items = listSynonyms.items;
                        const itemsLen = listSynonyms.items.length;
                        // initiate result.

                        for (let index = 0; index < itemsLen; index ++) {
                            this.state.results[index] = '-';
                            this.shuffleItemAnswers (index);
                        }
                        console.log ('result array: ', this.state.results);                   
        
                        return (<Question />);
                    }}
                </Connect>

                <Connect mutation={graphqlOperation(mutations.createPracticeHistory)}>
                  {({mutation}) => {
                      this.state.sendHistory = mutation;
                      return (<div></div>);
                  }}
                </Connect>

                <Connect mutation={graphqlOperation(mutations.createSynonymsSrs)}>
                  {({mutation}) => {
                      this.state.addSpacedRepetition = mutation;
                      return (<div></div>);
                  }}
                </Connect>

            </div>
        );
    }
}

export default withRouter(SynonymsChoises);