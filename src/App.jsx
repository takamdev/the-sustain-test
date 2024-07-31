
import { collection, addDoc,getDocs } from 'firebase/firestore';
import { db } from './firebase/config.js';
import { storage } from './firebase/config.js';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import ListPasseport from './components/ListPasseport.jsx';
import { useEffect } from 'react';
import { useState } from 'react';
// definition du schema de validation du formulaire
const schema = yup
  .object({
    Nom: yup.string().required("ce champ est requis"),    
    Pays: yup.string().required("ce champ est requis"),
    numCart:yup.string().required("ce champ est requis"),
    dateDel:yup.date().required("ce champ est requis"),
    dateExp:yup.date().required("ce champ est requis"),
    image:yup.mixed().required('Une image est requis')
  })
  .required()


function App() {
  const [list,setList]=useState([])
  const [uploadData,setUploadData]=useState(false)
  const [load,setLoad]=useState(false)
  // recuperation des donnes dans la bd de firebase
  const fetchData = async () => {
    try {
      // Référence à la collection "passager"
      const querySnapshot = await getDocs(collection(db, 'passager'));
      // Transformation des documents en un tableau d'objets
      const usersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      //console.log(usersList[0].dateDel.toString().replaceAll('\n',"").replaceAll(" ",""));
      setList(usersList)
      setLoad(false)
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
    }
  };

  useEffect(()=>{
    setLoad(true)//etat de chargement

    fetchData();
  },[])
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  })

//sauvegard
  const saveData = async (data,url,fileName)=>{
    //reference vers la collection
    const ref =collection(db,"passager")
    // construction des données
    const passeport = {
      Name:data.Nom,
      contry:data.Pays,
      cartId:data.numCart,
      // formatage de date
      dateDel:`
              ${data.dateDel.getDate()}
              /
              ${(parseInt(data.dateDel.getMonth())+1)<10?("0"+(parseInt(data.dateDel.getMonth())+1)):(parseInt(data.dateDel.getMonth())+1)}
              /${data.dateDel.getFullYear()}
              `,
      dateExp:`
            ${data.dateExp.getDate()}
            /
            ${(parseInt(data.dateExp.getMonth())+1)<10?("0"+(parseInt(data.dateExp.getMonth())+1)):(parseInt(data.dateExp.getMonth())+1)}
            /${data.dateExp.getFullYear()}
            `,
     img:url,
     fileName:fileName

    }
    //envoie des données
    try {
       await addDoc(ref,passeport)
       fetchData();//mise a jour dans le dom
    } catch (error) {
      console.log(error);
    }
   }

  //enregistrement d'un passeport
  const onSubmit = async (data) => {
    setUploadData(true)//etat de chargemnt
    const file = data.image[0]//fichier image
    // reference vers le store
    const storageRef = ref(storage, `images/${file.name}`);

    
    uploadBytes(storageRef, file).then(async ()=>{ // envoie de l'image
      const urlImage = await getDownloadURL(storageRef)//recuperation de l'url de l'image
      saveData(data,urlImage,file.name)//appel de la fonction de sauvegard
      setUploadData(false)//etat de chargement
    }).catch(err=>{
      console.log(err);
    })


  }


  
  return (
    <main className='container-fluid mt-5'>
      <div style={{backgroundColor:"#e7be43",height:'100px' ,textAlign:"center"}}>
         <p className='fs-3 fw-bold' style={{paddingTop:"25px"}}>Enregistrement de passeport</p>
      </div>
      <section className='row'>
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className='mt-5 col-lg-4 col-md-12 col-sm-12'>
        <div className="form-floating mb-3">
          <input {...register("Nom")} type="text" className="form-control h-25" id="floatingInput" placeholder="Nom"/>
          <label htmlFor="floatingInput">Nom</label>
        </div>
        <p className='text-danger'>{errors.Nom?.message}</p>
        <div className="form-floating mb-3">
          <input {...register("Pays")} type="text" className="form-control h-25" id="floatingInput" placeholder='Pays'/>
          <label htmlFor="floatingInput">Pays</label>
        </div>
        <p className='text-danger'>{errors.Pays?.message}</p>
        <div className="form-floating mb-3">
          <input {...register("numCart")}  type="text" className="form-control h-25" id="floatingInput" placeholder='number'/>
          <label htmlFor="floatingInput">numéro de carte</label>
        </div>
        <p className='text-danger'>{errors.numCart?.message}</p>
        <div className="form-floating mb-3">
          <input {...register("dateDel")} type="date" className="form-control h-25" id="floatingInput" placeholder='date del'/>
          <label htmlFor="floatingInput">date de delivrance</label>
        </div>
        <p className='text-danger'>{errors.dateDel?'ce champ est requis':""}</p>
        <div className="form-floating mb-3">
          <input {...register("dateExp")} type="date" className="form-control h-25" id="floatingInput" placeholder='date exp' />
          <label htmlFor="floatingInput">date d&apos;expiration</label>
        </div>
        <p className='text-danger'>{errors.dateExp?'ce champ est requis':""}</p>
        <div className="form-floating mb-3">
          <input {...register("image")} type="file" accept='image/*' className="form-control h-25" id="floatingInput" placeholder='image' />
          <label htmlFor="floatingInput">image</label>
        </div>
        <p className='text-danger'>{errors.image?.message}</p>
        <button type="submit" disabled={uploadData} className='btn btn-primary'>{uploadData?"enrégistrer...":"enrégistrer"} </button>
      </form>
      <article className='mt-5 col-lg-6 col-md-12 col-sm-12'>
        {
        load?(
          <p className='text-secondary text-center fs-3'>patientez...</p>
        ):(
           <ListPasseport data={list}/>
        )
       }
        
       
      </article>
      </section>
    </main>
  )
}

export default App