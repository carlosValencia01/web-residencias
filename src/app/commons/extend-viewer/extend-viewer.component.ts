import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-extend-viewer',
  templateUrl: './extend-viewer.component.html',
  styleUrls: ['./extend-viewer.component.scss']
})
export class ExtendViewerComponent implements OnInit {
  public pdf: any;
  public title: string;
  constructor(
    public dialogRef: MatDialogRef<ExtendViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      
      
    this.pdf = data.isBase64 ? data.source : URL.createObjectURL(data.source);
    this.title = data.title;    
  }

  ngOnInit() {
    if(this.title === 'XML DE CÉDULA'){      
      
      let reader = new FileReader();
            
      reader.onload = (data) =>{ //get only text              
        let text = this.excludeSpacesInNamesXML(data.target.result.toString());
        let textArea = document.getElementById('dataXML');
        let newHTML = "";
        //change text color to display
        let keywords = ["<cedulaelectronica","<cedula","</cedulaelectronica>","<profesionista","/>","<institucion","<carrera","<nodosep"];
        let wordCount  = 0, fordward=false //begin after line <?XML;
        const hasXMLLabel = text.indexOf('?xml') >-1;
        text.split(" ").forEach((word: string)=>{                
          if(fordward || !hasXMLLabel){
            if(wordCount>=40){ // number of characters x line
              newHTML+='<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
              wordCount=0;
            }
            if (keywords.indexOf(word.trim().toLowerCase()) > -1)
              newHTML += "<span style='color: maroon;'>" + word.replace('<','&lt;').replace('>','&gt;') + "&nbsp;</span>";
            else{
              if(word.indexOf('"') > -1){
                let asign  = word.split(`"`);                    
                newHTML += `<span style='color: chocolate;'>${asign[0].replace(/@+/g,' ')}</span><span style='color: blue;'>"${asign[1].replace(/@+/g,' ')}"&nbsp;</span> ${
                  asign[2] ? asign[2].indexOf('>') > -1 ? 
                    "<span style='color: maroon;'>"+asign[2].replace(/@+/g,' ').replace('<','&lt;').replace('>','&gt;')+"</span>":
                    '':'' 
                }`;
              }else{
                newHTML += "<span>" +  word.replace(/@+/g,' ').replace('<','&lt;').replace('>','&gt;') + "&nbsp;</span>";
              }
            }
              if(word.indexOf('>') > -1){// end of property
                newHTML+='<br>&nbsp;&nbsp;';
                wordCount=0;
              }
            wordCount+=word.length;
          }
          if(word.indexOf('?>') > -1) //end line <?XML;
          {
            fordward=true;
          }
        });              
        textArea.innerHTML = newHTML;
      };      
      reader.readAsText(this.data.source);
    }
  }
  excludeSpacesInNamesXML(text: string){
    let formatedText = '', temporalText='';
    let count = 0;
    text.replace(/\r?\n|\r/g,' ').split('').forEach(
      (character)=>{        
        if(character==`"`){// spaces into quotes    
          count++;
        }        
        if(count == 1){// text into quotes         
          temporalText+=character.indexOf(' ') > -1 ? '@' : character;
        }else if(count==0){
          formatedText+=character;
        }else if(count==2){
          formatedText+=temporalText+`"`;
          count=0;
          temporalText='';
        }
      }
    );
    return formatedText;
  }

}
