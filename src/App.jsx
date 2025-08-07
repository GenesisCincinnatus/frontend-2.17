import { useState, useEffect } from 'react'
import personService from './services/persons'

const Notification = ({ message, type }) => {
  if (!message) return null

  const className =
    type === 'error'
      ? 'notification error-message'
      : 'notification success-message'

  return <div className={className}>{message}</div>
}

const isValidPhoneNumber = (number) => {

  if (!/^\d{2,3}-\d{5,}$/.test(number)) return false

  const [area, rest] = number.split('-')
  const combined = area + rest

  if (/^0+$/.test(combined)) return false

  if (/^(\d)\1+$/.test(combined)) return false

  if ((number.match(/-/g) || []).length !== 1) return false

  for (const len of [2, 3]) {
    const pattern = combined.slice(0, len)
    const repeated = pattern.repeat(Math.ceil(combined.length / len)).slice(0, combined.length)
    if (repeated === combined) return false
  }

  return true
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [notification, setNotification] = useState({ message: null, type: null })

  useEffect(() => {
    personService.getAll().then(initialPersons => setPersons(initialPersons))
  }, [])

  const showNotification = (message, type) => {
    setNotification({ message, type })
    setTimeout(() => setNotification({ message: null, type: null }), 4000)
  }

  const handleAddPerson = (event) => {
    event.preventDefault()

    if (!isValidPhoneNumber(newNumber)) {
      showNotification('Invalid phone number format', 'error')
      return
    }

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
