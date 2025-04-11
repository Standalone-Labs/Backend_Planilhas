import app from "./src/app";
const porta = 3000;
app.listen((porta), (error) => {
    if(error){
        console.log(error);
    }else{
        console.log(`Servidor rodando http://localhost:${porta}`)
    }
})