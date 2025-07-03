import { useState, useEffect } from 'react'
import personsService from './services/persons'
import './index.css'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')


  useEffect(() => {
    personsService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
      .catch(error => {
        console.error("Error fetching persons:", error)
      })
  }, [])

  const addPerson = (event) => {
  event.preventDefault()
  const existingPerson = persons.find(p => p.name === newName)

  if (existingPerson) {
    const confirmUpdate = window.confirm(
      `${newName} is already added to phonebook, replace the old number with a new one?`
    )

    if (confirmUpdate) {
      const updatedPerson = { ...existingPerson, number: newNumber }

      personsService
        .update(existingPerson.id, updatedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(p =>
            p.id !== existingPerson.id ? p : returnedPerson
          ))
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          setErrorMessage(`Information of ${existingPerson.name} has already been removed from server`)
          setTimeout(() => {setErrorMessage('')}, 4000)})}

    return
  }

  const newPerson = { name: newName, number: newNumber }

  personsService
    .create(newPerson)
    .then(returnedPerson => {
      setPersons(persons.concat(returnedPerson))
      setNewName('')
      setNewNumber('')
      setSuccessMessage(`${returnedPerson.name} is successfully added!`)
      setTimeout(() => {
        setSuccessMessage('')
      }, 1500);
    })
    .catch(error => {
      console.error("Error adding person:", error)
    })
}


  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const filteredPersons = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  const handleDelete = (id, name) => {
  console.log("Deleting", id, name)
  const confirmDelete = window.confirm(`Delete ${name}?`)
  if (!confirmDelete) return

  personsService
    .remove(id)
    .then(() => {
      setPersons(persons.filter(person => person.id !== id))
    })
    .catch(error => {
      console.error("Error deleting person:", error)
    })
}

const Notification = ({ message, type }) => {
  if (!message) return null

  return <div className={type === 'success' ? 'success-message' : 'error-message'}>{message}</div>
}




  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage || errorMessage} type={successMessage ? 'success' : 'error'} />


      <div>
        Filter shown with:
        <input value={filter} onChange={handleFilterChange} />
      </div>

      <h3>Add a new</h3>
      <form onSubmit={addPerson}>
        <div>
          Name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          Number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <h3>Numbers</h3>
      <div>
        {filteredPersons.map(person =>
        <div key={person.id}>
          {person.name} {person.number}
          <button onClick={() => handleDelete(person.id, person.name)}>delete</button>
          </div>
        )}

        </div>
    </div>
  )
}

export default App
