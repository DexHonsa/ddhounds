import { resolve } from "path";

export default (client) => {
  
    return new Promise((resolve)=>{
      pdfjsLib.getDocument('/api/static/pdfs/Payment_Letter.pdf').then(doc=>{
        doc.getPage(1).then(page=>{
          let myCanvas = document.getElementById('payment_letter');
          let context = myCanvas.getContext('2d');
            let viewport = page.getViewport(2);
            myCanvas.width = viewport.width;
            myCanvas.height = viewport.height;
            
            page.render({
                canvasContext:context,
                viewport:viewport
            })
            
            // let accountNumber = new CanvasInput({
            //   canvas: myCanvas,
            //   fontSize:23,
            //   fontFamily:'Times New Roman',
            //   fontColor: '#212121',
            //   backgroundColor:'#ff9900',
            //   position:'absolute',
            //   y:0,
            //   x:0,
            //   fontWeight: 'normal',
            //   width: 300,
            //   height:30,
            //   padding: 8,
            //   borderWidth: 0,
            //   borderColor: '#fff',
            //   borderRadius: 0,
            //   boxShadow: 'none',
            //   innerShadow: 'none',
            //   value: client.account_number
            // });

            resolve( () => {
              //accountNumber.destroy();
            })
        })
    })
    }) 
}