export const initialDashboardConfig = (dataSourceId: string) => {
  return {
    dashboard: {
      annotations: {
        list: [
          {
            builtIn: 1,
            datasource: {
              type: 'grafana',
              uid: '-- Grafana --',
            },
            enable: true,
            hide: true,
            iconColor: 'rgba(0, 211, 255, 1)',
            name: 'Annotations & Alerts',
            target: {
              limit: 100,
              matchAny: false,
              tags: [],
              type: 'dashboard',
            },
            type: 'dashboard',
          },
        ],
      },
      editable: true,
      fiscalYearStartMonth: 0,
      graphTooltip: 0,
      iteration: 1660221329648,
      links: [],
      liveNow: false,
      panels: [
        {
          datasource: {
            type: 'mysql',
            uid: dataSourceId,
          },
          description: '',
          fieldConfig: {
            defaults: {
              color: {
                mode: 'palette-classic',
              },
              custom: {
                axisLabel: '',
                axisPlacement: 'auto',
                axisSoftMin: 0,
                fillOpacity: 80,
                gradientMode: 'none',
                hideFrom: {
                  legend: false,
                  tooltip: false,
                  viz: false,
                },
                lineWidth: 1,
                scaleDistribution: {
                  type: 'linear',
                },
              },
              mappings: [],
              thresholds: {
                mode: 'absolute',
                steps: [
                  {
                    color: 'green',
                    value: null,
                  },
                  {
                    color: 'red',
                    value: 80,
                  },
                ],
              },
            },
            overrides: [],
          },
          gridPos: {
            h: 8,
            w: 12,
            x: 0,
            y: 0,
          },
          id: 1,
          options: {
            barRadius: 0,
            barWidth: 0.97,
            groupWidth: 0.7,
            legend: {
              calcs: [],
              displayMode: 'list',
              placement: 'bottom',
            },
            orientation: 'auto',
            showValue: 'auto',
            stacking: 'none',
            tooltip: {
              mode: 'single',
              sort: 'none',
            },
            xTickLabelRotation: 0,
            xTickLabelSpacing: 0,
          },
          targets: [
            {
              datasource: {
                type: 'mysql',
                uid: dataSourceId,
              },
              format: 'time_series',
              group: [],
              metricColumn: 'none',
              rawQuery: true,
              rawSql:
                'SELECT\n  $__timeGroupAlias(time,$interval),\n  avg(value) AS "value"\nFROM series_$deviceId\nWHERE\n  $__timeFilter(time) AND\n  parameter_id = "$parameter" AND\n  aggregate = "mean"\nGROUP BY 1\nORDER BY $__timeGroup(time,$interval)\n',
              refId: 'A',
              select: [
                [
                  {
                    params: ['value'],
                    type: 'column',
                  },
                ],
              ],
              table: 'series_simulation1',
              timeColumn: 'time',
              timeColumnType: 'timestamp',
              where: [
                {
                  name: '$__timeFilter',
                  params: [],
                  type: 'macro',
                },
              ],
            },
          ],
          title: 'Bar Chart',
          type: 'barchart',
        },
        {
          datasource: {
            type: 'mysql',
            uid: dataSourceId,
          },
          fieldConfig: {
            defaults: {
              color: {
                mode: 'thresholds',
              },
              mappings: [],
              thresholds: {
                mode: 'absolute',
                steps: [
                  {
                    color: 'green',
                    value: null,
                  },
                  {
                    color: 'red',
                    value: 80,
                  },
                ],
              },
            },
            overrides: [],
          },
          gridPos: {
            h: 8,
            w: 12,
            x: 0,
            y: 8,
          },
          id: 2,
          options: {
            orientation: 'auto',
            reduceOptions: {
              calcs: ['lastNotNull'],
              fields: '',
              values: false,
            },
            showThresholdLabels: false,
            showThresholdMarkers: true,
          },
          pluginVersion: '8.5.6',
          targets: [
            {
              datasource: {
                type: 'mysql',
                uid: dataSourceId,
              },
              format: 'time_series',
              group: [],
              metricColumn: 'none',
              rawQuery: true,
              rawSql:
                'SELECT\n  $__timeGroupAlias(time,$interval),\n  avg(value) AS "value"\nFROM series_$deviceId\nWHERE\n  $__timeFilter(time) AND\n  parameter_id = "$parameter" AND\n  aggregate = "mean"\nGROUP BY 1\nORDER BY time DESC\nLIMIT 1\n\n',
              refId: 'A',
              select: [
                [
                  {
                    params: ['value'],
                    type: 'column',
                  },
                ],
              ],
              table: 'series_simulation1',
              timeColumn: 'time',
              timeColumnType: 'timestamp',
              where: [
                {
                  name: '$__timeFilter',
                  params: [],
                  type: 'macro',
                },
              ],
            },
          ],
          title: 'Gauge',
          type: 'gauge',
        },
        {
          datasource: {
            type: 'mysql',
            uid: dataSourceId,
          },
          fieldConfig: {
            defaults: {
              color: {
                mode: 'palette-classic',
              },
              custom: {
                axisLabel: '',
                axisPlacement: 'auto',
                barAlignment: 0,
                drawStyle: 'line',
                fillOpacity: 0,
                gradientMode: 'none',
                hideFrom: {
                  legend: false,
                  tooltip: false,
                  viz: false,
                },
                lineInterpolation: 'linear',
                lineWidth: 1,
                pointSize: 5,
                scaleDistribution: {
                  type: 'linear',
                },
                showPoints: 'auto',
                spanNulls: false,
                stacking: {
                  group: 'A',
                  mode: 'none',
                },
                thresholdsStyle: {
                  mode: 'off',
                },
              },
              mappings: [],
              thresholds: {
                mode: 'absolute',
                steps: [
                  {
                    color: 'green',
                    value: null,
                  },
                  {
                    color: 'red',
                    value: 80,
                  },
                ],
              },
            },
            overrides: [],
          },
          gridPos: {
            h: 8,
            w: 12,
            x: 0,
            y: 16,
          },
          id: 3,
          options: {
            legend: {
              calcs: [],
              displayMode: 'list',
              placement: 'bottom',
            },
            tooltip: {
              mode: 'single',
              sort: 'none',
            },
          },
          targets: [
            {
              datasource: {
                type: 'mysql',
                uid: dataSourceId,
              },
              format: 'time_series',
              group: [],
              metricColumn: 'none',
              rawQuery: true,
              rawSql:
                'SELECT\n  $__timeGroupAlias(time,$interval),\n  avg(value) AS "value"\nFROM series_$deviceId\nWHERE\n  $__timeFilter(time) AND\n  parameter_id = "$parameter" AND\n  aggregate = "mean"\nGROUP BY 1\nORDER BY $__timeGroup(time,$interval)\n',
              refId: 'A',
              select: [
                [
                  {
                    params: ['value'],
                    type: 'column',
                  },
                ],
              ],
              timeColumn: 'time',
              where: [
                {
                  name: '$__timeFilter',
                  params: [],
                  type: 'macro',
                },
              ],
            },
          ],
          title: 'Line Series',
          type: 'timeseries',
        },
      ],
      refresh: '',
      schemaVersion: 36,
      style: 'dark',
      tags: [],
      templating: {
        list: [
          {
            current: {
              selected: false,
              text: '',
              value: '',
            },
            hide: 0,
            name: 'parameter',
            options: [
              {
                selected: false,
                text: '',
                value: '',
              },
            ],
            query: '',
            skipUrlSync: false,
            type: 'textbox',
          },
          {
            current: {
              selected: false,
              text: '',
              value: '',
            },
            hide: 0,
            name: 'deviceId',
            options: [
              {
                selected: false,
                text: '',
                value: '',
              },
            ],
            query: '',
            skipUrlSync: false,
            type: 'textbox',
          },
          {
            auto: true,
            auto_count: 30,
            auto_min: '10s',
            current: {
              selected: true,
              text: 'auto',
              value: '$__auto_interval_interval',
            },
            hide: 0,
            name: 'interval',
            options: [
              {
                selected: true,
                text: 'auto',
                value: '$__auto_interval_interval',
              },
              {
                selected: false,
                text: '1m',
                value: '1m',
              },
              {
                selected: false,
                text: '10m',
                value: '10m',
              },
              {
                selected: false,
                text: '30m',
                value: '30m',
              },
              {
                selected: false,
                text: '1h',
                value: '1h',
              },
              {
                selected: false,
                text: '6h',
                value: '6h',
              },
              {
                selected: false,
                text: '12h',
                value: '12h',
              },
              {
                selected: false,
                text: '1d',
                value: '1d',
              },
              {
                selected: false,
                text: '7d',
                value: '7d',
              },
              {
                selected: false,
                text: '14d',
                value: '14d',
              },
              {
                selected: false,
                text: '30d',
                value: '30d',
              },
            ],
            query: '1m,10m,30m,1h,6h,12h,1d,7d,14d,30d',
            queryValue: '',
            refresh: 2,
            skipUrlSync: false,
            type: 'interval',
          },
        ],
      },
      time: {
        from: 'now-6h',
        to: 'now',
      },
      timepicker: {},
      timezone: '',
      title: 'Default dashboard',
      uid: 'rhbNVMmVk',
      version: 1,
      weekStart: '',
    },
    folderId: 0,
    inputs: [],
    overwrite: true,
  };
};
