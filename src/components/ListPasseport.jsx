import { TiDelete } from "react-icons/ti"; 
import { AiTwotoneEdit } from "react-icons/ai"; 
import { AiOutlineSearch } from "react-icons/ai"; 
import { useEffect } from "react";
import { useState } from "react"
import { getDownloadURL, ref, uploadBytes,deleteObject } from "firebase/storage";
import { doc, deleteDoc,setDoc } from 'firebase/firestore';
import { db,storage } from "../firebase/config.js";
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"

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

function ListPasseport({data}) {

 const filtre = data
 const [passport ,setPasseport]=useState(data)
 const [filter,setFilter] = useState([])
 const [valueSearch ,setValueSearch]=useState('')
 const [defaultData,setDefaultData]=useState()
 const [loadSearch ,setLoadSearch] = useState(false)
 const [loadUpdate,setLoadUpdate]= useState(false)
 const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  resolver: yupResolver(schema),
})


const onSubmit = (edit) =>{
  setLoadUpdate(true)
  //reference vers l'encien fichier
  const storageRef = ref(storage, `images/${defaultData.fileName}`);

 // Nouveau fichier à télécharger
 const newFile = edit.image[0]

  uploadBytes(storageRef, newFile).then( async (snapshot) => {
    console.log('Nouveau fichier téléchargé avec succès', snapshot);
    const urlImage = await getDownloadURL(storageRef)//recuperation de l'url de l'image

    const docRef = doc(db, 'passager', defaultData.id);

    // Les nouvelles données du document
    const newData = {
      Name:edit.Nom,
      contry:edit.Pays,
      cartId:edit.numCart,
      // formatage de date
      dateDel:`
              ${edit.dateDel.getDate()}
              /
              ${(parseInt(edit.dateDel.getMonth())+1)<10?("0"+(parseInt(edit.dateDel.getMonth())+1)):(parseInt(edit.dateDel.getMonth())+1)}
              /${edit.dateDel.getFullYear()}
              `,
      dateExp:`
            ${edit.dateExp.getDate()}
            /
            ${(parseInt(edit.dateExp.getMonth())+1)<10?("0"+(parseInt(edit.dateExp.getMonth())+1)):(parseInt(edit.dateExp.getMonth())+1)}
            /${edit.dateExp.getFullYear()}
            `,
     img:urlImage,
     fileName:newFile.name
    }

  // Remplacement du document ou création s'il n'existe pas
  setDoc(docRef, newData)
    .then(() => {
      console.log('Document créé ou remplacé avec succès');
      setLoadUpdate(false)
      let newPasseport=passport.filter(item=>item.id!==defaultData.id)
      newPasseport = [...newPasseport,newData]
      setPasseport(newPasseport)
      document.querySelector('#modalClose').click()
    })
    .catch((error) => {
      console.error('Erreur lors de la création ou du remplacement du document:', error);
    });
    //modification des donnees avec la nouvel url
  }).catch((error) => {
    console.error('Erreur lors du téléchargement du fichier:', error);
  });


}

 useEffect(()=>{
    const contryList = filtre.map(item=>item.contry)
    const uniqueArray = [...new Set(contryList)];
    setFilter(uniqueArray)
    setPasseport(data)
 },[data])

 const search = ()=>{
  if(!loadSearch){
    setLoadSearch(true)
    if(valueSearch.trim()!==""){
      const result = passport.find(item=>item.cartId.includes(valueSearch))
      if(result!==undefined)setPasseport([result])
        else setPasseport([])
      
     }
  }


 }
 const select = (value)=>{
  if(value.trim()!==""){
    const result= filtre.filter(item =>item.contry===value)
    setPasseport(result)
  }else{
    setPasseport(data)
  }
 }

 const deletePasseport = (item)=>{
  const id = item.id

  const confirm = window.confirm('voulez vous vraiment supprimer se passeport ?')
  if(confirm){
    //console.log(item);
    const docRef = doc(db, 'passager', id);
    // Suppression du document
    deleteDoc(docRef)
      .then(() => {
          const result= passport.filter(item=>item.id!==id)
          setPasseport(result)

          //suppression de l'image
          const fileRef = ref(storage, `images/${item.fileName}`);
          deleteObject(fileRef).then(() => {
            console.log('Fichier supprimé avec succès');
          }).catch((error) => {
            console.error('Erreur lors de la suppression du fichier:', error);
          });
      })
      .catch((error) => {
        console.error('Erreur lors de la suppression du document:', error);
      });
   }
 
 }
  return (
    <div className="w-100">
      
        <div className="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">Modifier le passeport</h1>
                <button type="button" className="btn-close" id="modalClose" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
                  <div className="modal-body">
                        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                            <div className="form-floating mb-3">
                            <input defaultValue={defaultData&&defaultData.Name}  {...register("Nom")} type="text" className="form-control h-25" id="floatingInput" placeholder="Nom"/>
                            <label htmlFor="floatingInput">Nom</label>
                            </div>
                            <p className='text-danger'>{errors.Nom?.message}</p>
                            <div className="form-floating mb-3">
                            <input defaultValue={defaultData&&defaultData.contry} {...register("Pays")} type="text" className="form-control h-25" id="floatingInput" placeholder='Pays'/>
                            <label htmlFor="floatingInput">Pays</label>
                            </div>
                            <p className='text-danger'>{errors.Pays?.message}</p>
                            <div className="form-floating mb-3">
                            <input defaultValue={defaultData&&defaultData.cartId} {...register("numCart")}  type="text" className="form-control h-25" id="floatingInput" placeholder='number'/>
                            <label htmlFor="floatingInput">numéro de carte</label>
                            </div>
                            <p className='text-danger'>{errors.numCart?.message}</p>
                            <div className="form-floating mb-3">
                            <input  {...register("dateDel")} type="date" className="form-control h-25" id="floatingInput" placeholder='date del'/>
                            <label htmlFor="floatingInput">date de delivrance</label>
                            </div>
                            <p className='text-danger'>{errors.dateDel?'ce champ est requis':""}</p>
                            <div className="form-floating mb-3">
                            <input  {...register("dateExp")} type="date" className="form-control h-25" id="floatingInput" placeholder='date exp' />
                            <label htmlFor="floatingInput">date d&apos;expiration</label>
                            </div>
                            <p className='text-danger'>{errors.dateExp?'ce champ est requis':""}</p>
                            <div className="form-floating mb-3">
                            <input  {...register("image")} type="file" accept='image/*' className="form-control h-25" id="floatingInput" placeholder='image' />
                            <label htmlFor="floatingInput">image</label>
                            </div>
                            <p className='text-danger'>{errors.image?.message}</p>
                            <button disabled={loadUpdate} type="submit" className='btn btn-primary'>{loadUpdate?"Modification...":"Modifier"}</button>
                        </form>
                     </div>
                            
                        
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-between align-items-center">
            <p className="w-25 d-flex search">
             <input value={valueSearch} onChange={(e)=>{setValueSearch(e.target.value),setLoadSearch(false)}}  type="text" className="form-control  mb-3" id="floatingInput" placeholder="identifiant"/>
             <AiOutlineSearch  className="fs-3 iconSearch" role="button" onClick={search} />
             </p>
            <select onChange={(e)=>{select(e.target.value)}} className="form-select w-25 mb-3" aria-label="Default select example">
                <option value="" selected>fitrer pas pays</option>
                {
                    filter.map((item,key)=>{
                        return <option key={key} value={item}>{item}</option>
                    })
                }
            </select>
        </div>
          {
            passport.length ===0 ? (
              <p className="text-center fs-4">aucun passeport trouver</p>
            ):(
              <div className="table-responsive">
                 <table className="table  w-100">
                    <thead>
                        <tr>
                        <th scope="col">N</th>
                        <th scope="col">Nom</th>
                        <th scope="col">Pays</th>
                        <th scope="col">identifiant</th>                
                        <th scope="col">délivrance</th>             
                        <th scope="col">expiration</th>
                        <th scope="col">photo</th>
                        <th scope="col">action</th>


                        </tr>
                    </thead>
                    <tbody>
                      {
                        passport.map((item,key)=>{
                            return  <tr key={key}>
                                        <th scope="row">{key+1}</th>
                                        <td>{item.Name}</td>
                                        <td>{item.contry}</td>
                                        <td>{item.cartId}</td>
                                        <td>{item.dateDel.toString().replaceAll('\n',"").replaceAll(" ","")}</td>
                                        <td>{item.dateExp.toString().replaceAll('\n',"").replaceAll(" ","")}</td>
                                        <td><img width={50} src={item.img} alt="image" /></td>
                                        <td><TiDelete onClick={()=>{deletePasseport(item)}} style={{color:"red"}} className="fs-3" /><AiTwotoneEdit onClick={()=>{setDefaultData(item)}} data-bs-toggle="modal" data-bs-target="#staticBackdrop"  className="text-primary fs-3"/></td>
                                    </tr>
                        })
                        
                      }
                        
                      
                    </tbody>
                </table>
              </div>
               
            )
          }
        
    </div>
  )
}

export default ListPasseport