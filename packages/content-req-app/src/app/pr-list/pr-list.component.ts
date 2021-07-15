import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-pr-list',
  templateUrl: './pr-list.component.html',
})
export class PrListComponent implements OnInit, OnDestroy {
  tableRows: any[];
  cbValue = true;

  constructor() {
  }

  ngOnInit(): void {
    this.tableRows = [
      {
        column1: 'PR1233',
        column2: 'Shoes II. ',
        column3: 'Mar 30, 2020',
        column4: '3',
        column5: '$10,500.00 USD'
      },
      {
        column1: 'PR5555',
        column2: 'Laptop 123.XX. ',
        column3: 'Mar 31, 2020',
        column4: '1',
        column5: '$500.00 USD'
      },
      {
        column1: 'PR1200',
        column2: 'Wheel 13"',
        column3: 'May 03, 2020',
        column4: '2',
        column5: '$200.00 USD'
      },
      {
        column1: 'PR1233',
        column2: 'Shoes II. ',
        column3: 'Mar 30, 2020',
        column4: '3',
        column5: '$10,500.00 USD'
      }
    ];
  }

  ngOnDestroy(): void {
  }

  onItemClicked($event: MouseEvent, id: string): void {
  }
}
