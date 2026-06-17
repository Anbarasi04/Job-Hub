import axios from "axios";
import { useEffect, useState } from "react";

function Todo() {
    const [todos, setTodos] = useState([]);
    const [modal, setModal] = useState(false);
    const [todo, setTodo] = useState("");
    const [editId, setEditId] = useState();

    useEffect(()=>{
        fetchTodos();
    }, [])

    const fetchTodos = async() => {
        try{
            const res = await axios.get("http://localhost:5000/api/todos");
            setTodos(res.data);
            console.log("Todos:", res.data);
        }
        catch(err){
            console.log("Error:", err);
        }
    }

    const handleDelete = async(id) => {
         const res = await axios.delete(`http://localhost:5000/api/delete/${id}`);
         alert("Deleted Todo Successfully");
         setTodos(todos.filter((todo)=> todo._id != id));
    }

    const handleChange = async(e) => {
        setTodo(e.target.value);
    }

    const handleCreate = async() => {
          const data = {content: todo};
          const res = await axios.post("http://localhost:5000/api/createTodos", data);
          alert("Todo Added Successfully");
          console.log("Data:", res.data);
          setTodos([...todos, res.data]);
          setTodo(" ");
    }

    const handleModal = (id) => {
        setModal(true);
        setEditId(id);
    }

    const handleUpdate = async() => {
          const data = {content: todo};  
          const res = await axios.put(`http://localhost:5000/api/update/${editId}`, data);
          setTodos(todos.map((todo)=> todo._id == editId ? res.data : todo));
          alert("Todo Updated Successfully");
          setEditId("");
          setModal(false);
    }
    
    return(
        <>
          <h3>Your Todos</h3> 
          <div className="createCont">
                <label htmlFor="content">Enter a Todo: 
                <input type="text" id="content" value={todo} placeholder="Enter a todo" onChange={(e)=>handleChange(e)}></input></label>
                <button className="action-btn" onClick={handleCreate}>➕ Create</button>
          </div>
          
          {modal &&
            <div id="updateCont">
                <input type="text" name="todo" placeholder="Enter a todo" onChange={(e)=>handleChange(e)}></input>
                <button className="action-btn" onClick={handleUpdate}>Update</button>
            </div>
          }
          {
            todos.map((todo)=>(
                <div key={todo._id}>
                    <p>{todo.content}</p>
                    <button className="action-btn" onClick={()=> handleModal(todo._id)}>✏️</button>
                    <button className="action-btn" onClick={()=>handleDelete(todo._id)}>🗑️</button>
                </div>
            ))
          }
        </>
    )
}

export default Todo;