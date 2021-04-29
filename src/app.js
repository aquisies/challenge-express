var express = require("express");
var server = express();
//var bodyParser = require("body-parser");


// var model = {  
//     clients: {
//        javier: [{
//            date: fecha.date,
//            status: 'pending'
//           }
//       ] } }

var model = {
    clients: {},
    reset : ()=>{
        model.clients = {};
    },
    attend : (name, date)=>{        
        model.clients[name]=model.clients[name].map(elem=>{
            if(elem.date===date)
               elem.status='attended';
            return elem});
    },    
    expire : (name, date)=>{        
        model.clients[name]=model.clients[name].map(elem=>{
            if(elem.date===date)
               elem.status='expired';
            return elem});
    },       
    cancel : (name, date)=>{        
        model.clients[name]=model.clients[name].map(elem=>{
            if(elem.date===date)
               elem.status='cancelled';
            return elem});
    },
    erase : (name, query)=>{

        if (query==='attended' ||query==='cancelled' || query==='expired')
           model.clients[name]=
                model.clients[name].filter(elem=>elem.status!==query);
     
            model.clients[name]=
                  model.clients[name].filter(elem=>elem.date!==query);
        

    },
    addAppointment: (name, objDate = {})=>{
        if(!model.clients[name]){
            model.clients[name] = [];
        }
        const appoint= {date: objDate.date,status:'pending' }
        model.clients[name].push(appoint);
        
    },
    getAppointments: (name, status='')=>{
        if (!status) return model.clients[name]; 
        
        if(model.clients[name])
            return model.clients[name].filter(elem=>elem.status===status);     
    },

    getClients : ()=>{
       return Object.keys(model.clients);
    }

};




server.use(express.json());

//server.get('/', (req, res)=>{res.send('HOla')});

server.get('/', function(req, res){ //Ruta para un GET a /
    res.send('Hello CP-False!!'); // response "Hola mundo!" en la pagina principal
  });

server.get('/api', (req, res)=>{
    return res.json(model.clients)
});

server.post('/api/Appointments', (req, res)=>{
 const {client, appointment}= req.body;
 
 if (!client)
     return res.status(400).send('the body must have a client property');
 
 if (!isNaN(parseInt(client)))
    return res.status(400).send('client must be a string');

  model.addAppointment(client,appointment);
  return res.json(model.getAppointments(client)[0]);  
});

server.get('/api/Appointments/clients', (req, res)=>{
   res.send(model.getClients());
});


server.get('/api/Appointments/:name', (req, res)=>{
    const {client, appointment}= req.body;
    const name = req.params.name;
    const {date, option}= req.query;
    let filterAppointments= model.clients[name]; 

    //responds with a status 400 (bad request) and a string message, if the client does not exis
    if (!model.getClients().includes(name)) 
        return res.status(400).send('the client does not exist');
  
    //Responds with a status 400 (bad request)    
    //console.log('1->', filterAppointments);    
    if(filterAppointments.length){
        const filterDate= filterAppointments.filter(item=>item.date===date)
        //console.log('filterDate->', filterDate);  
        if (!filterDate.length)
            return res.status(400).send('the client does not have a appointment for that date');
        
        if (option ==='wrongOption')
            return res.status(400).send('the option must be attend, expire or cancel');
        
        if (option==='attend')
            return res.send(model.attend(name, date))
        
        if (option==='expire')
            return res.send(model.expire(name, date))
        
        if (option==='cancel'){
            model.cancel(name, date);
            return res.send(filterDate[0]);           
        }
    }
    
});



 server.get('/api/Appointments/:name/erase', (req, res)=>{
    //const {client, appointment}= req.body;
    const name = req.params.name;
    const {date}= req.query;

    //console.log (name, date);
    
    //responds with a status 400 (bad request) and a string message, if the client does not exis
    if (!model.getClients().includes(name)) 
    return res.status(400).send('the client does not exist');
    
    return res.send(model.erase(name, date));

 });

 server.get('/api/Appointments/getAppointments/:name', (req, res)=>{
    const name = req.params.name;
    const {status}= req.query;

    const getClient= model.clients[name].filter(elem=>elem.status===status); 

    res.send(getClient);

 });


server.listen(3000);
module.exports = { model, server };
