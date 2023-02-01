import React, { useState } from 'react';
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

const wholeRange = {
  startValue: new Date('2009-01-01T00:00:00.000000Z'),
  endValue: new Date('2019-06-30T23:59:56.000000Z'),
};

const App = () => {
  const [visualRange, setVisualRange] = useState({
    startValue: new Date('2009-02-02T00:00:05.000000Z'),
    endValue: new Date('2009-02-02T00:00:10.000000Z'),
  });
  let packetsLock = 0;
  const HALFDAY = 0.5;
  const chartDataSource = new DataSource({
    store: [],
    sort: 'pickup_datetime',
    paginate: false,
  });

  const handleChange = (e) => {
    if (e.fullName === 'argumentAxis.visualRange') {
      // console.log(e.fullName);
      const stateStart = visualRange.startValue;
      const currentStart = e.value.startValue;
      // console.log(stateStart, currentStart);
      if (stateStart.valueOf() !== currentStart.valueOf()) {
        setVisualRange(e.value);
      }
      onVisualRangeChanged(e.component);
    }
  };

  const onVisualRangeChanged = (component) => {
    const items = component.getDataSource().items();
    // console.log(items);
    if (
      !items.length ||
      items[0].pickup_datetime - visualRange.startValue >= HALFDAY ||
      visualRange.endValue - items[items.length - 1].pickup_datetime >= HALFDAY
    ) {
      uploadDataByVisualRange(component);
    }
  };

  const uploadDataByVisualRange = async (component) => {
    const dataSource = component.getDataSource();
    const storage = dataSource.items();
    // console.log(storage);
    const ajaxArgs = {
      startVisible: visualRange.startValue,
      endVisible: visualRange.endValue,
      startBound: storage.length ? storage[0].pickup_datetime : null,
      endBound: storage.length
        ? storage[storage.length - 1].pickup_datetime
        : null,
    };
    // console.log(ajaxArgs);
    if (
      ajaxArgs.startVisible !== ajaxArgs.startBound &&
      ajaxArgs.endVisible !== ajaxArgs.endBound &&
      !packetsLock
    ) {
      packetsLock += 1;
      // component.showLoadingIndicator();
      try {
        const data = await getDataFrameAPI(ajaxArgs);
        packetsLock -= 1;
        const fetchedData = data.dataset;
        const componentStorage = dataSource.store();

        fetchedData
          .map((i) => ({
            pickup_datetime: new Date(i[0]),
            trip_distance: i[1],
          }))
          .forEach((item) => componentStorage.insert(item));

        dataSource.reload();
        onVisualRangeChanged(component);
      } catch {
        packetsLock -= 1;
        dataSource.reload();
      }
    }
  };

  const getDataFrameAPI = async (args) => {
    const HOST = 'https://demo.questdb.io';
    const query = `SELECT pickup_datetime, trip_distance FROM trips WHERE pickup_datetime BETWEEN 
    '${args.startVisible.toISOString()}' AND '${args.endVisible.toISOString()}'`;

    return await fetch(`${HOST}/exec?query=${encodeURIComponent(query)}`).then(
      (response) => response.json()
    );
  };

  return (
    <Chart
      id="chart"
      title="UI Assessment Task"
      palette="Harmony Light"
      dataSource={chartDataSource}
      onOptionChanged={handleChange}
    >
      <ZoomAndPan argumentAxis="both" />
      <ScrollBar visible={true} />
      <ArgumentAxis
        argumentType="datetime"
        visualRangeUpdateMode="auto"
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
      <Series
        argumentField="pickup_datetime"
        valueField="trip_distance"
        name="Distance"
      />
      <Animation enabled={false} />
      <LoadingIndicator backgroundColor="none">
        <Font size={14} />
      </LoadingIndicator>
      <Legend visible={false} />
    </Chart>
  );
};

export default App;
