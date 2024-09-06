'use client';
import { useEffect, useState } from 'react';
import { mockQueryPoke, mockQuerySwapiNetlify } from '../../mocks/query';
import { makeNewUrl, urlConverter } from '@/methods/graphql/urlConverter';
import { mockHeadersPoke, mockHeadersSwapi } from '@/mocks/headers';
import { mockVariablesPoke } from '@/mocks/variables';
import { mockEndpointUrlPoke, mockEndpointUrlSwapiNetlify } from '@/mocks/urls';
import { Button } from '@mui/material';
import ResponseGQL from '@/components/graphql/ResponseGQL';
import SDLUrlInput from '@/components/graphql/SdlUrl';
import EndpointUrlInput from '@/components/graphql/EndpointUrl';
import HeadersBlock from '@/components/graphql/HeadersBlock';
import GqlQueryInput from '@/components/graphql/GqlQueryInput';
import VariablesBlock from '@/components/graphql/VariablesGQL';
import DocumentationGQL from '@/components/graphql/Documentation';
import {
  saveDocumentation,
  saveResponse,
  setAlertMessage,
  updateAllDataWhenPageLoads,
  updateSDL,
} from '@/reducers/actions/actions';
import { useDispatch, useSelector } from 'react-redux';
import { gql, request } from 'graphql-request';
import { AppDispatch } from '@/reducers/root/rootReduces';
import { saveHistory } from '@/methods/saveHistoryData';
import Alerts from '@/components/Alert';
import gqlPrettier from 'graphql-prettier';
import { IState, IHeaders, IErrors } from '@/interfaces/interfaces';
import { getIntrospectionQuery, buildClientSchema, printSchema } from 'graphql';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader/Loader';
import { getCookie } from 'cookies-next';
import './page.css';

export default function GraphQL() {
  const dispatch = useDispatch<AppDispatch>();
  const endpointUrl = useSelector((state: IState) => state.main.endpointUrlInput);
  const sdlUrl = useSelector((state: IState) => state.main.sdlUrlInput);
  const headers = useSelector((state: IState) => state.main.headersKeys);
  const query = useSelector((state: IState) => state.main.queryInput);
  const variables = useSelector((state: IState) => state.main.variablesInput);
  const errorMessage = useSelector((state: IState) => state.main.error);
  const document = useSelector((state: IState) => state.main.documentation);
  const languageData = useSelector((state: IState) => state.main.languageData);
  const router = useRouter();
  const [loginStatus, setLoginStatus] = useState(false);

  useEffect(() => {
    const getLoginStatus = getCookie('loginStatus');
    if (!getLoginStatus) {
      router.push('/');
    } else {
      setLoginStatus(true);
      const currentUrl = window.location.href;
      dispatch(updateAllDataWhenPageLoads(currentUrl));
    }
  }, []);

  useEffect(() => {
    brokenSubmit();
  }, []);

  const brokenSubmit = () => {
    dispatch(saveResponse(false, 0, false));
    dispatch(saveDocumentation(''));
  };

  const handleSubmitInput = async () => {
    handleSubmit();
  };

  const handleSubmitPoke = async () => {
    const currentUrl = window.location.href;
    const convertedDataToUrl = urlConverter(
      mockEndpointUrlPoke,
      mockHeadersPoke,
      gqlPrettier(mockQueryPoke),
      mockVariablesPoke
    );
    const newUrl = makeNewUrl(currentUrl, convertedDataToUrl);
    window.history.pushState({}, '', newUrl);
    dispatch(updateAllDataWhenPageLoads(newUrl));
    dispatch(updateSDL(`${mockEndpointUrlPoke}?sdl`));
  };

  const handleSubmitSwapi = async () => {
    const currentUrl = window.location.href;
    const convertedDataToUrl = urlConverter(mockEndpointUrlSwapiNetlify, mockHeadersSwapi, mockQuerySwapiNetlify, '');
    const newUrl = makeNewUrl(currentUrl, convertedDataToUrl);
    window.history.pushState({}, '', newUrl);
    dispatch(updateAllDataWhenPageLoads(newUrl));
    dispatch(updateSDL(`${mockEndpointUrlSwapiNetlify}?sdl`));
  };

  const showAlert = (error: string) => {
    dispatch(setAlertMessage(error));
    if (errorMessage === '') {
      setTimeout(() => {
        dispatch(setAlertMessage(''));
      }, 3000);
    }
  };

  const displayFetchErrors = (err: unknown) => {
    const errorData = err as IErrors;

    try {
      const message = errorData.response.errors[0].message;
      const code = errorData.response.status;
      dispatch(saveResponse(JSON.stringify(message), code, false));
    } catch {
      showAlert(errorData.message);
    }
  };

  const handleSubmit = async () => {
    let stages = 0;
    let variablesSubmit: string | object = variables === '' || Object.keys(variables).length === 0 ? '{}' : variables;
    let headersTransformed;
    const currentUrl = window.location.href;

    try {
      // инпут у нас строка, и тут мы проверяем, было наше значение строчным объектом или нет
      const parsedVariables: object = JSON.parse(variablesSubmit);
      variablesSubmit = parsedVariables;
      stages += 1;
    } catch (err) {
      brokenSubmit();
      const errorMessage = err as IErrors;
      showAlert(errorMessage.message);
    }

    if (stages === 1) {
      try {
        // Проверяем наши headers
        const checkedHeaders: IHeaders[] = JSON.parse(headers);
        headersTransformed = Object.fromEntries(checkedHeaders.map((h) => [h.key, h.value]));
        stages += 1;
      } catch (err) {
        const errorMessage = err as IErrors;
        brokenSubmit();
        showAlert(errorMessage.message);
      }
    }

    if (stages === 2) {
      // Тут мы работаем с ответом и историей
      try {
        const queryTransformed = gql`
          ${query}
        `;
        const body = await request(endpointUrl, queryTransformed, variablesSubmit as object, headersTransformed);
        dispatch(saveResponse(JSON.stringify(body, null, 2), 200, true));

        saveHistory(currentUrl, 'GraphiQL', sdlUrl);
        stages += 1;
      } catch (err) {
        brokenSubmit();
        displayFetchErrors(err);
      }
    }
    if (stages === 3) {
      // Тут мы работаем с документацией
      try {
        const fetchSchema = async (url: string) => {
          const query = getIntrospectionQuery();
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
          });
          return response.json();
        };
        const schemaResponse = await fetchSchema(sdlUrl);
        const { data } = schemaResponse;
        const clientSchema = buildClientSchema(data);
        const schemaSDL = printSchema(clientSchema);
        dispatch(saveDocumentation(schemaSDL));
      } catch (err) {
        brokenSubmit();
        displayFetchErrors(err);
      }
    }
  };

  return (
    <>
      {loginStatus && (
        <div className="graphql_page_wrapper">
          <div className="graphiql-wrapper">
            <div className={`graphiql-wrapper-inner ${document ? 'graphiql_100' : 'graphiql_95'}`}>
              <DocumentationGQL></DocumentationGQL>
              <div className={`graphiql-block ${document ? 'graphiql_50' : ''}`}>
                <h2 className="h2">{languageData.graphQlHeader}</h2>
                <EndpointUrlInput></EndpointUrlInput>
                <SDLUrlInput></SDLUrlInput>
                <HeadersBlock></HeadersBlock>
                <GqlQueryInput></GqlQueryInput>
                <VariablesBlock></VariablesBlock>
                <div className={'submit_gql_buttons'}>
                  <Button variant="outlined" onClick={handleSubmitInput}>
                    {languageData.submitInput}
                  </Button>
                  <Button variant="outlined" onClick={handleSubmitPoke}>
                    {languageData.submitPoke}
                  </Button>
                  <Button variant="outlined" onClick={handleSubmitSwapi}>
                    {languageData.submitSwapi}
                  </Button>
                </div>
              </div>
              <ResponseGQL></ResponseGQL>
            </div>
          </div>
          <Alerts></Alerts>
        </div>
      )}

      {!loginStatus && <Loader />}
    </>
  );
}