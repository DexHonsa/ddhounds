export default (client) => {
  return new Promise((resolve)=>{
    pdfjsLib.getDocument('/api/static/pdfs/init_demand.pdf').then(doc=>{
      doc.getPage(1).then(page=>{
          var myCanvas = document.getElementById('init_demand');
          var context = myCanvas.getContext('2d');
          context.clearRect(0, 0, myCanvas.width, myCanvas.height);
          var viewport = page.getViewport(2);
          myCanvas.width = viewport.width;
          myCanvas.height = viewport.height;
          
          page.render({
              canvasContext:context,
              viewport
          })
          var accountNumber =  new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Times New Roman',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:270,
              x:230,
              fontWeight: 'normal',
              width: 300,
              height:30,
              padding: 8,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              value: client.account_number
            });
            var amountDue = new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Times New Roman',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:325,
              x:230,
              fontWeight: 'normal',
              width: 300,
              height:30,
              padding: 8,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              value:'$'
            });
            var creditor = new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Times New Roman',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:380,
              x:230,
              fontWeight: 'normal',
              width: 350,
              height:30,
              padding: 8,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              value:client.creditor
            });
            var dateOfNotice = new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Times New Roman',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:435,
              x:240,
              fontWeight: 'normal',
              width: 300,
              height:30,
              padding: 8,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              value:client.date_of_notice
            });
            var name = new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Courier New',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:1425,
              x:120,
              fontWeight: 'normal',
              width: 300,
              height:20,
              padding: 5,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              textTransform:'uppercase',
              value:`${client.first_name.toUpperCase()} ${client.middle_name.toUpperCase()} ${client.last_name.toUpperCase()}`
            });
            var address1 = new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Courier New',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:1455,
              x:120,
              fontWeight: 'normal',
              width: 300,
              height:20,
              padding: 5,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              textTransform:'uppercase',
              value:`${client.street1.toUpperCase()} ${client.street2.toUpperCase()}`
            });
            var address2 = new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Courier New',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:1485,
              x:120,
              fontWeight: 'normal',
              width: 300,
              height:20,
              padding: 5,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              textTransform:'uppercase',
              value:`${client.city.toUpperCase()} ${client.state.toUpperCase()} ${client.zip}`
            });
            var accountNumber2 = new CanvasInput({
              canvas: myCanvas,
              fontSize: 21,
              fontFamily: 'Times New Roman',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:1270,
              x:720,
              fontWeight: 'normal',
              width: 150,
              height:20,
              padding: 5,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              value:client.account_number
            });
            var amountDue2 = new CanvasInput({
              canvas: myCanvas,
              fontSize: 23,
              fontFamily: 'Times New Roman',
              fontColor: '#212121',
              backgroundColor:'#fff',
              position:'absolute',
              y:1270,
              x:910,
              fontWeight: 'normal',
              width: 150,
              height:20,
              padding: 5,
              borderWidth: 0,
              borderColor: '#fff',
              borderRadius: 0,
              boxShadow: 'none',
              innerShadow: 'none',
              value:'$'
            });
            accountNumber.render();
              amountDue.render();
              creditor.render();
              dateOfNotice.render();
              name.render();
              address1.render();
              address2.render();
              accountNumber2.render();
              amountDue2.render();
            resolve(()=> {
              accountNumber.destroy();
              amountDue.destroy();
              creditor.destroy();
              dateOfNotice.destroy();
              name.destroy();
              address1.destroy();
              address2.destroy();
              accountNumber2.destroy();
              amountDue2.destroy();
            })
          
      })
  })
  }) 
  }

    
