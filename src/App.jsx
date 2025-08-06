import { useState, useEffect } from 'react'
import personService from './services/persons'

const Notification = ({ message, type }) => {
  if (!message) return null

  const style = {
    color: type === 'error' ? 'red' : 'green',
    background: '#f2f2f2',
    fontSize: 16,
    border: `2px solid ${type === 'error' ? 'red' : 'green'}`,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  }

  return <div style={style}>{message}</div>
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [notification, setNotification] = useState({ message: null, type: null })

  useEffect(() => {
    personService.getAll().then(initialPersons => setPersons(initialPersons))
  }, [])

  const handleAddPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(p => p.name === newName)
    const newPerson = { name: newName, number: newNumber }

    if (existingPerson) {
      if (window.confirm(`${newName} ya está en la agenda. ¿Deseas actualizar el número?`)) {
        personService
          .update(existingPerson.id, newPerson)
          .then(updated => {
            setPersons(persons.map(p => p.id !== updated.id ? p : updated))
            showNotification(`Número de ${updated.name} actualizado`, 'success')
          })
          .catch(error => {
            showNotification(error.response.data.error || 'Error al actualizar', 'error')
          })
      }
    } else {
      personService
        .create(newPerson)
        .then(created => {
          setPersons(persons.concat(created))
          showNotification(`Se añadió a ${created.name}`, 'success')
        })
        .catch(error => {
          showNotification(error.response.data.error || 'Error al añadir', 'error')
        })
    }

    setNewName('')
    setNewNumber('')
  }

  const handleDelete = (id) => {
    const person = persons.find(p => p.id === id)
    if (person && window.confirm(`¿Eliminar a ${person.name}?`)) {
      personService.remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          showNotification(`Se eliminó a ${person.name}`, 'success')
        })
        .catch(() => {
          showNotification(`Ya se había eliminado a ${person.name}`, 'error')
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: null, type: null }), 4000)
  }

  return (
    <div>
      <h2>Agenda Telefónica</h2>
      <Notification message={notification.message} type={notification.type} />

      <form onSubmit={handleAddPerson}>
        <div>
          Nombre: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <div>
          Número: <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
        </div>
        <div>
          <button type="submit">Agregar</button>
        </div>
      </form>

      <h3>Contactos</h3>
      <ul>
        {persons.map(person =>
          <li key={person.id}>
            {person.name} - {person.number}
            <button onClick={() => handleDelete(person.id)}>Eliminar</button>
          </li>
        )}
      </ul>
    </div>
  )
}

export default App