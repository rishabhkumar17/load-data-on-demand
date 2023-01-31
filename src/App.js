import React, { useEffect, useState } from 'react';
import Chart, {
  ArgumentAxis,
  Series,
  ZoomAndPan,
  Legend,
  ScrollBar,
  ValueAxis,
  Title,
  Font,
  Label,
  Animation,
  LoadingIndicator,
} from 'devextreme-react/chart';

const HOST = 'https://demo.questdb.io';
const wholeRange = {
  startValue: '2009-01-01T00:00:00.000000Z',
  endValue: '2019-06-30T23:59:56.000000Z',
};

const App = () => {
  const [tripData, setTripData] = useState([]);
  const [visualRange, setVisualRange] = useState({
    startValue: '2009-01-01T00:00:00.000000Z',
    endValue: '2009-01-01T00:00:16.000000Z',
  });
  const fetchAPI = async () => {
    try {
      const query =
        'SELECT pickup_datetime, trip_distance FROM trips ORDER BY pickup_datetime LIMIT 10;';

      const fetchedData = await fetch(
        `${HOST}/exec?query=${encodeURIComponent(query)}`
      );
      const data = await fetchedData.json();
      console.log(data);
      const tripZoomingData = [];
      data.dataset.forEach((element) => {
        tripZoomingData.push({
          pickup_datetime: element[0],
          trip_distance: element[1],
        });
      });
      console.log(tripZoomingData);
      setTripData(tripZoomingData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <Chart id="chart" palette="Harmony Light" dataSource={tripData}>
      <Series argumentField="pickup_datetime" valueField="trip_distance" />
      <ArgumentAxis
        argumentType="datetime"
        visualRangeUpdateMode="keep"
        visualRange={visualRange}
        // wholeRange={wholeRange}
      />
      <ValueAxis name="trip_distance" allowDecimals={false}>
        <Title text={'Trip Distance, km'}>
          <Font color="#ff950c" />
        </Title>
        <Label>
          <Font color="#ff950c" />
        </Label>
      </ValueAxis>
      <ScrollBar visible={true} />
      <ZoomAndPan argumentAxis="both" />
      <Animation enabled={false} />
      <LoadingIndicator backgroundColor="none">
        <Font size={14} />
      </LoadingIndicator>
      <Legend visible={false} />
    </Chart>
  );
};

export default App;
