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
import DataSource from 'devextreme/data/data_source';

const HOST = 'https://demo.questdb.io';
const wholeRange = {
  startValue: '2009-01-01T00:00:00.000000Z',
  endValue: '2019-06-30T23:59:56.000000Z',
};

const App = () => {
  const [chartDataSource, setChartDataSource] = useState();
  // const chartDataSource = new DataSource({
  //   store: [],
  //   sort: 'date',
  //   paginate: false,
  // });

  const [visualRange, setVisualRange] = useState({
    startValue: '2009-01-01T00:00:05.000000Z',
    endValue: '2009-01-01T00:00:12.000000Z',
  });
  const [packetsLock, setPacketsLock] = useState(0);
  const HALFDAY = 43200000;
  // const fetchAPI = async () => {
  //   try {
  //     const query =
  //       'SELECT pickup_datetime, trip_distance FROM trips ORDER BY pickup_datetime LIMIT 10;';

  //     const fetchedData = await fetch(
  //       `${HOST}/exec?query=${encodeURIComponent(query)}`
  //     );
  //     const data = await fetchedData.json();
  //     console.log(data);
  //     const tripZoomingData = [];
  //     data.dataset.forEach((element) => {
  //       tripZoomingData.push({
  //         pickup_datetime: element[0],
  //         trip_distance: element[1],
  //       });
  //     });
  //     console.log(tripZoomingData);
  //     setChartDataSource(tripZoomingData);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // useEffect(() => {
  //   handleChange();
  // }, []);

  const handleChange = (e) => {
    if (e.fullName === 'argumentAxis.visualRange') {
      const stateStart = visualRange.startValue;
      const currentStart = e.value.startValue;
      // console.log(new Date(stateStart).valueOf());
      // console.log(currentStart.valueOf());
      if (new Date(stateStart).valueOf() !== currentStart.valueOf()) {
        setVisualRange({
          startValue: e.value.startValue.toISOString(),
          endValue: e.value.endValue.toISOString(),
        });
        // console.log(visualRange);
        // console.log(e);
        onVisualRangeChanged(e.component);
      }
    }
  };

  const onVisualRangeChanged = (component) => {
    const items = component.getDataSource().items();
    if (
      !items.length ||
      items[0].date - visualRange.startValue >= this.HALFDAY ||
      visualRange.endValue - items[items.length - 1].date >= this.HALFDAY
    ) {
      uploadDataByVisualRange(component);
    }
  };

  const uploadDataByVisualRange = async (component) => {
    const dataSource = component.getDataSource();
    const storage = dataSource.items();
    const ajaxArgs = {
      startVisible: visualRange.startValue,
      endVisible: visualRange.endValue,
      startBound: storage.length ? storage[0].pickup_datetime : null,
      endBound: storage.length
        ? storage[storage.length - 1].pickup_datetime
        : null,
    };

    if (
      ajaxArgs.startVisible !== ajaxArgs.startBound &&
      ajaxArgs.endVisible !== ajaxArgs.endBound &&
      !packetsLock
    ) {
      setPacketsLock(packetsLock + 1);
      component.showLoadingIndicator();
      try {
        const fetchedData = await (await getDataFrameAPI(ajaxArgs)).json();
        setPacketsLock(packetsLock - 1);
        const componentStorage = dataSource.store();
        console.log(componentStorage);

        fetchedData
          .map((item) => ({
            pickup_datetime: item[0],
            trip_distance: item[1],
          }))
          .forEach((item) => componentStorage.insert(item));

        dataSource.reload();
        this.onVisualRangeChanged(component);
      } catch {}
    }
    // console.log(dataSource);
  };

  const getDataFrameAPI = async (args) => {
    const query =
      'SELECT pickup_datetime, trip_distance FROM trips ORDER BY pickup_datetime LIMIT 10;';

    return await fetch(`${HOST}/exec?query=${encodeURIComponent(query)}`);
  };
  return (
    <Chart
      id="chart"
      palette="Harmony Light"
      dataSource={chartDataSource}
      onOptionChanged={(e) => handleChange(e)}
    >
      <Series argumentField="pickup_datetime" valueField="trip_distance" />
      <ArgumentAxis
        argumentType="datetime"
        visualRangeUpdateMode="keep"
        visualRange={visualRange}
        wholeRange={wholeRange}
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
