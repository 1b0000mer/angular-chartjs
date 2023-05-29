import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

import Chart from 'chart.js/auto';

interface CPUData {
  label: string;
  data: number[];
  pointBorderColor: string;
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  tension: number;
}

interface chartData {
  labels: string[];
  datasets: CPUData[];
}

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css']
})

export class LineChartComponent implements OnInit, OnDestroy {
  button: any;
  state: any;
  msg: any;

  public chart: any;
  data: chartData;

  numCPU: any;
  initChart = false;

  socket$: any;
  subcription!: Subscription;

  constructor() {
    this.data = {
      labels: [],
      datasets: []
    }
  }

  ngOnInit(): void {
    this.connectSocket();
  }

  ngOnDestroy(): void {
    this.destroySocket();
  }

  destroySocket(): void {
    this.msg = 'Stopped!';
    this.subcription.unsubscribe();
    this.socket$.complete();
  }

  connectSocket() :void {
    this.msg = 'Connecting to Websocket';
    this.socket$ = new WebSocketSubject('ws://localhost:4444');
    this.subcription = this.socket$.subscribe(
      (data: number[]) => {
        this.msg = 'Success!';
        if (!this.initChart) {
          this.initChartData(data.length);
          this.state = true;
          this.button = 'Stop';
        }
        //Update chartData with received data
        this.updateData(data);
      },
      () => {
        this.msg = 'Could not establish connection to WebSocket';
        this.button = 'Refresh';
        this.state = null
      }
    );
  }

  updateData(data: number[]): void {
    const time = new Date().toLocaleTimeString();
    this.data.labels.push(time);

    let i = 0;
    for (i = 0; i < data.length; i++) {
      this.data.datasets[i].data.push(data[i]);
      if (this.data.labels.length >= 11) {
        this.data.labels.shift();
        let j = 0;
        for (j = 0; j < data.length; j++) {
          this.data.datasets[j].data.shift();
        }
      }
    };
    this.chart.update("none");
    // console.log('Chart data:', this.data);
  }

  initChartData(numCPU: number): void {
    let i = 0;
    for (i = 0; i < numCPU; i++) {
      var color = this.random_rgba();
      var cpuData: CPUData = {
        label: 'CPU ' + i,
        data: [],
        backgroundColor: `rgba(220, 220, 220, 0.2)`,
        borderColor: color,
        pointBorderColor: '#fff',
        fill: true,
        tension: 0.3
      };
      
      this.data.datasets.push(cpuData);
    }
    this.createChart();
    this.initChart = true;
  }

  createChart(): void {
    this.chart = new Chart("MyChart", {
      type: 'line',
      data: this.data,
      // options: {
      //   aspectRatio:2.5
      // }
    });
    this.chart.update();
  }

  pause(): void {
    if (this.state) {
      this.button = 'Resume';
      this.state = false;

      this.destroySocket();
    } else if (!this.state) {
      this.button = 'Stop';
      this.state = true;

      this.connectSocket();
    } else {
      window.location.reload();
    }
    
  }

  random_rgba() {
    var o = Math.round, r = Math.random, s = 255;
    return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
  }
}
