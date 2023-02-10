import { useEffect, useState, Fragment } from "react"
import { invoke } from '@forge/bridge';
import SectionMessage from '@atlaskit/section-message';
import Spinner from '@atlaskit/spinner';
import Pagination from '@atlaskit/pagination';
import Button from '@atlaskit/button';  
import {
  Content,
  Main,
  PageLayout,
} from '@atlaskit/page-layout';
import '../common/stati.css';

import {
  SummaryActions, SummaryCount, SummaryFooter, ScrollContainer, TitleContainer,
} from '../Styles';
import { ResourceTile } from "./ResourceTile";
var showdown = require('showdown');

const EventVersion = (props) => {
  const { event, navigate, homeUrl } = props;
  const counts = [];
  const rows = [];
  const converter = new showdown.Converter();

  if (event.hasOwnProperty('displayName')) 
    rows.push({name: 'Event Version', 
                value: (event.displayName ? event.version + " [" + event.displayName + "]" : event.version), 
                type: 'String', url: event.versionUrl});
  else
    rows.push({name: 'Event Version', value: event.version, type: 'String', url: event.versionUrl});
  
  if (event.hasOwnProperty('description')) rows.push({name: 'Description', value: converter.makeHtml(event.description), type: 'String'});
  if (event.hasOwnProperty('state')) rows.push({name: 'State', value: event.state, type: 'String'});
  if (event.hasOwnProperty('eventName')) rows.push({name: 'Event Name', value: event.eventName, type: 'String', url: event.eventUrl, navigate: navigate});
  if (event.hasOwnProperty('schemaName')) {
    rows.push({name: "Schema", type: "Table", value: [
      {name: 'Name:', value: event.schemaName, type: 'String', url: event.schemaUrl},
      {name: 'Value:', value: event.schemaVersionName, type: 'String', url: event.schemaVersionUrl}
    ]});
  }

  if (event.hasOwnProperty('schemaPrimitiveType') && event.schemaPrimitiveType) rows.push({name: 'Schema Primitive Type', value: event.schemaPrimitiveType, type: 'String'});
  if (event.hasOwnProperty('domainName')) rows.push({name: 'Domain', value: event.domainName, type: 'String', url: event.domainUrl});
  
  if (event.customAttributes && event.customAttributes.length) {
    rows.push({name: 'Custom Attributes', value: '<i>(' + event.customAttributes.length + ') found</i>', type: 'String'});
    event.customAttributes.map(ca => {
      rows.push({name: "", type: "Table", value: [
        {name: 'Name:', value: ca.name, type: 'String'},
        {name: 'Value:', value: ca.value, type: 'String'}
      ]});
    });
  }

  if (event.producerApplications && event.producerApplications.length) {
    rows.push({name: 'Declared Producer Applications', value: '<i>(' + event.producerApplications.length + ') found</i>', type: 'String'});
    event.producerApplications.map(ca => {
      rows.push({name: "", type: "Table", value: [
        {name: 'Name:', value: ca.applicationName, type: 'String', url: ca.applicationUrl},
        (ca.hasOwnProperty('versionName') ?
          {name: 'Version:', value: ca.version + " [" + ca.versionName + "]", type: 'String', url: ca.versionUrl} :
          {name: 'Version:', value: ca.version, type: 'String', url: ca.versionUrl})
      ]});
    })
  }

  if (event.consumerApplications && event.consumerApplications.length) {
    rows.push({name: 'Declared Consumer Applications', value: '<i>(' + event.consumerApplications.length + ') found</i>', type: 'String'});
    event.consumerApplications.map(ca => {
      rows.push({name: "", type: "Table", value: [
        {name: 'Name:', value: ca.applicationName, type: 'String', url: ca.applicationUrl},
        (ca.hasOwnProperty('versionName') ?
          {name: 'Version:', value: ca.version + " [" + ca.versionName + "]", type: 'String', url: ca.versionUrl} :
          {name: 'Version:', value: ca.version, type: 'String', url: ca.versionUrl})
      ]});
    })
  }

  if (event.consumers && event.consumers.length) {
    rows.push({name: 'Consumers', value: '<i>(' + event.consumers.length + ') found</i>', type: 'String'});
    event.consumers.map(ca => {
      const caRows = [];
      caRows.push({name: 'Name', value: ca.name, type: 'String'});
      caRows.push({name: 'Broker Type', value: ca.brokerType, type: 'String'});
      caRows.push({name: 'Consumer Type', value: ca.consumerType, type: 'String'});
      caRows.push({name: 'Type', value: ca.type, type: 'String'});
    
      if (ca.subscriptions && ca.subscriptions.length) {
        caRows.push({name: 'Subscriptions:', value: '', type: 'String'});
        ca.subscriptions.map((caa, index) => {
          caRows.push({name: '[' + index + ']', value: caa.value + ' (' + caa.subscriptionType + ')', type: 'String'});
        });
      }
      caRows.push({name: 'Created Time', value: new Date(ca.createdTime).toLocaleString(), type: 'String'});
      caRows.push({name: 'Updated Time', value: new Date(ca.updatedTime).toLocaleString(), type: 'String'});
      rows.push({name: '', value: caRows, type: 'Table'});
    })
    if (event.hasOwnProperty('createdTime')) rows.push({name: 'Created Time', value: new Date(event.createdTime).toLocaleString(), type: 'String'});
    if (event.hasOwnProperty('updatedTime')) rows.push({name: 'Updated Time', value: new Date(event.updatedTime).toLocaleString(), type: 'String'});
  }

  return (
    <ResourceTile 
      name={{name: 'Event Version', value: event.name, url: event.url}} 
      counts={counts} 
      rows={rows} />
  )
}

export const SolaceEventVersions = (props) => {
  const { command, homeUrl, token, paginate, navigate, page, setIsBlanketVisible} = props;
  const [eventVersions, setEventVersions] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    try {
      console.log('SolaceEventVersions Token', token);
      (async () => {
        const eventVersions = await invoke('get-ep-resource', {command, token: token.value});
        console.log(eventVersions);
        setEventVersions(eventVersions);
        setIsBlanketVisible(false);
      })();
    } catch (err) {
      setLoadFailed(true);
      setIsBlanketVisible(false);
    }
  }, [ page ]);

  if (!eventVersions && !loadFailed) {
    return (
      <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
        <p>Loading Event Versions <Spinner size="medium" interactionName="load" /></p>
      </div>
    )  
  }

  if (loadFailed) {
    return (
      <SectionMessage appearance="error">
        <p>Failed to load Event Versions</p>
      </SectionMessage>
    )  
  }

  const getPageButtons = (num) => {
    if (num <= 1)
      return "";

    let arr = [];
    for (let i=0; i<num; i++)
      arr.push(i+1)
    
    return <Pagination pages={arr} selectedIndex={page-1} onChange={paginate} />
  }

  const goHome = () => {
    navigate(homeUrl);
  }

console.log('IN SOLACE EVENT VERSIONS', eventVersions?.data);

  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <TitleContainer>Event Versions</TitleContainer>
      <PageLayout>
        <Content>
          <Main>
          <ScrollContainer>
          <Fragment>            
            {eventVersions?.data.length && eventVersions.data.map((event, index) => {
              return <EventVersion key={index} navigate={goHome} event={event} />
            })}
          </Fragment>
          </ScrollContainer>
          </Main>
        </Content>
      </PageLayout>      
      <SummaryFooter>
        <SummaryCount>
          {eventVersions.meta && eventVersions.meta.pagination &&
            getPageButtons(eventVersions.meta.pagination.totalPages)}
          {(!eventVersions.meta || !eventVersions.meta.pagination) &&
            getPageButtons(1)}
        </SummaryCount>
        <SummaryActions>
        {command.url !== homeUrl && 
            <Button appearance="subtle" onClick={() => navigate(homeUrl)}>Back</Button>}
        </SummaryActions>
      </SummaryFooter>             
    </div>
  )
}