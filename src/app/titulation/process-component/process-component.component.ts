import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-process-component',
  templateUrl: './process-component.component.html',
  styleUrls: ['./process-component.component.scss']
})
export class ProcessComponentComponent implements OnInit {
  @Input('Message') Message: String;
  @Input('Type') Type: String;
  @Input('Title') Title: String;
  public existTitle: boolean;
  constructor() {

  }

  ngOnInit() {
    this.existTitle = this.Title !== '';
  }
}
