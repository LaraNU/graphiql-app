'use client';
import { useDispatch } from 'react-redux';
import { Link } from '@mui/material';
import { updateAllDataWhenPageLoads } from '@/reducers/actions/actions';
import { AppDispatch } from '@/reducers/root/rootReduces';
import { useEffect, useState } from 'react';
import { dataFromUrl } from '@/methods/graphql/urlConverter';
import { IHistoryData, IResults, mockHistoryArrayElement } from '@/interfaces/interfaces';

const mockHistoryElement: IHistoryData = {
  name: '',
  data: {
    endpointUrl: '',
    sdlUrl: '',
    headers: [
      {
        key: '',
        value: '',
      },
    ],
    query: '',
    variables: '',
  },
  index: 0,
  url: '',
  clientName: '',
};

export default function HistoryModule() {
  const dispatch = useDispatch<AppDispatch>();
  const [historyData, setHistory] = useState<IHistoryData[]>([mockHistoryElement]);
  const changeDataInInput = async (index: number) => {
    dispatch(updateAllDataWhenPageLoads(historyData[index].url));
  };

  const loadHistoryFromLS = () => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('history_data');
      if (savedState) {
        try {
          const historyArray = JSON.parse(savedState);
          // Это будет массив [объект с данными, объект с данными]
          const newHistoryArray: IHistoryData[] = [];
          historyArray.map((element: mockHistoryArrayElement, index: number) => {
            const mockCopy = JSON.stringify(mockHistoryElement);
            const newElement: IHistoryData = JSON.parse(mockCopy);
            try {
              const partialData: IResults | false = dataFromUrl(element.url);
              if (partialData) {
                newElement.data.endpointUrl = partialData.endpointUrl;
                newElement.data.sdlUrl = element.sdlUrl !== '' ? element.sdlUrl : `${partialData.endpointUrl}?sdl`;
                newElement.data.query = partialData.query;
                newElement.data.headers = partialData.headers;
                newElement.data.variables = partialData.variables;
                newElement.index = index;
                newElement.name = '';
                newElement.url = element.url;
                newElement.clientName = element.client;
                newHistoryArray.push(newElement);
              }
            } catch {
              console.log('Ошибка временная');
            }
          });
          setHistory(newHistoryArray);
        } catch {
          console.error('invalid data in local storage');
        }
      }
    }
  };

  useEffect(() => {
    loadHistoryFromLS();
  }, []);

  return (
    <main className="main">
      <div className="container">
        <div className="history-wrapper">
          <nav>
            <ul>
              {historyData.map((item, index) => {
                return (
                  <li key={`historyKey${index}`}>
                    {item.clientName}<span>&nbsp;&nbsp;</span>
                    <Link
                      underline="none"
                      color="black"
                      href={item.url}
                      key={`historyKey${index + 1}`}
                      onClick={() => changeDataInInput(index)}
                    >
                      {item.data.endpointUrl}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </main>
  );
}
