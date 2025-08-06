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
      if (window.confirm(`${newName} is already added to the phonebook. Replace the old number with a new one?`)) {
        personService
          .update(existingPerson.id, newPerson)
          .then(updated => {
            setPersons(persons.map(p => p.id !== updated.id ? p : updated))
            showNotification(`${updated.name}'s number was updated`, 'success')
          })
          .catch(error => {
            showNotification(error.response.data.error || 'Failed to update number', 'error')
          })
      }
    } else {
      personService
        .create(newPerson)
        .then(created => {
          setPersons(persons.concat(created))
          showNotification(`Added ${created.name}`, 'success')
        })
        .catch(error => {
          showNotification(error.response.data.error || 'Failed to add person', 'error')
        })
    }

    setNewName('')
    setNewNumber('')
  }

  const handleDelete = (id) => {
    const person = persons.find(p => p.id === id)
    if (person && window.confirm(`Delete ${person.name}?`)) {
      personService.remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          showNotification(`Deleted ${person.name}`, 'success')
        })
        .catch(() => {
          showNotification(`${person.name} was already deleted from server`, 'error')
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
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type} />

      <form onSubmit={handleAddPerson}>
        <div>
          name: <input value={newName} onChange={(e) => setNewName(e.target.value)} />
        </div>
        <div>
          number: <input value={newNumber} onChange={(e) => setNewNumber(e.target.value)} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>

      <h3>Numbers</h3>
      <div>
        {persons.map(person =>
          <div key={person.id}>
            {person.name} {person.number}
            <button onClick={() => handleDelete(person.id)}>delete</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App