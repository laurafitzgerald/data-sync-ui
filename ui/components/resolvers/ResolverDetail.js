import React, { Component } from "react";
import { graphql } from "react-apollo";
import {
    Form,
    FormGroup,
    Button,
    EmptyState,
    EmptyStateIcon,
    EmptyStateTitle
} from "patternfly-react";

import { DataSourcesDropDown } from "./DataSourcesDropDown";
import { MappingTemplateDropDown } from "./MappingTemplateDropDown";

import UpsertResolver from "../../graphql/UpsertResolver.graphql";
import GetSchema from "../../graphql/GetSchema.graphql";
import GetResolvers from "../../graphql/GetResolvers.graphql";

import {
    detailHeader, detailFormsContainer, learnMore, detailFormsHeader, formContainer,
    detailFormGroup, detailButtonFooter, buttonSave, detailEmpty, emptyTitle
} from "./ResolverDetail.css";

const INITIAL_STATE = {
    resolver: null,
    requestMappingTemplate: "Custom",
    responseMappingTemplate: "Custom",
    err: ""
};

class ResolverDetail extends Component {

    constructor(props) {
        super(props);
        this.state = INITIAL_STATE;
    }

    componentWillReceiveProps({ resolver }) {
        console.log("new resolver", resolver);
        if (this.props.resolver !== resolver) {
            console.log("new state", { ...INITIAL_STATE, ...resolver });
            this.setState({ ...INITIAL_STATE, resolver });
        }
    }

    updateResolver(newProps) {
        this.setState({ resolver: { ...newProps } });
    }

    save() {
        this.upsertResolver()
            .then(() => console.log("saved"))
            .catch(err => console.log(err));
    }

    upsertResolver() {
        const { resolver } = this.state;
        const { schemaId, type } = resolver;

        return this.props.mutate({
            variables: { ...resolver },
            refetchQueries: [
                { query: GetSchema, variables: { name: "default" } },
                { query: GetResolvers, variables: { schemaId, type } }
            ]
        });
    }

    renderEmptyScreen() {
        return (
            <EmptyState className={detailEmpty}>
                <EmptyStateIcon name="info" />
                <EmptyStateTitle className={emptyTitle}>
                    Select an item to view and edit its details
                </EmptyStateTitle>
            </EmptyState>
        );
    }

    render() {
        const { resolver, requestMappingTemplate, responseMappingTemplate } = this.state;

        if (!resolver) {
            return this.renderEmptyScreen();
        }

        const { field, type, DataSource, requestMapping, responseMapping, preHook, postHook } = resolver;

        return (
            <React.Fragment>
                <h3 className={detailHeader}>Edit {type}.{field}</h3>
                <div className={detailFormsContainer}>
                    <h3 className={detailFormsHeader}>Resolver
                        <span className={learnMore}>
                            <a href="https://www.google.es">Learn More <span className="fa fa-external-link" /></a>
                        </span>
                    </h3>

                    <Form horizontal className={formContainer}>
                        <FormGroup controlId="dataSource" className={detailFormGroup}>
                            <DataSourcesDropDown
                                selected={DataSource}
                                onDataSourceSelect={ds => this.updateResolver({ DataSource: ds })}
                            />
                        </FormGroup>

                        <FormGroup controlId="requestMapping" className={detailFormGroup}>
                            <MappingTemplateDropDown
                                label="Request Mapping Template"
                                template={requestMappingTemplate}
                                text={requestMapping}
                                onTemplateSelect={t => this.setState({ requestMappingTemplate: t })}
                                onTextChange={t => this.updateResolver({ requestMapping: t })}
                            />
                        </FormGroup>

                        <FormGroup controlId="responseMapping" className={detailFormGroup}>
                            <MappingTemplateDropDown
                                label="Response Mapping Template"
                                template={responseMappingTemplate}
                                text={responseMapping}
                                onTemplateSelect={t => this.setState({ responseMappingTemplate: t })}
                                onTextChange={t => this.updateResolver({ responseMapping: t })}
                            />
                        </FormGroup>
                    </Form>
                </div>

                <div className={detailButtonFooter}>
                    <Button
                        className={buttonSave}
                        bsStyle="primary"
                        onClick={() => this.save()}
                    >
                        Save
                    </Button>
                    {/* <Button bsStyle="default" onClick={() => console.log("cancel")}>Cancel</Button> */}
                </div>

            </React.Fragment>
        );
    }

}

const ResolverDetailWithMutation = graphql(UpsertResolver)(ResolverDetail);

export { ResolverDetailWithMutation as ResolverDetail };
