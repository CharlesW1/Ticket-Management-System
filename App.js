import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, SafeAreaView, ScrollView, View, Text, TextInput, Button, Alert, Image } from 'react-native';
import Storage from './Storage';
import * as ImagePicker from 'expo-image-picker';
import ModalDropdown from 'react-native-modal-dropdown';

function Ticket({ticket, setTickets}) {
  return (
    <View style={styles.ticket}>
      <ModalDropdown
        style={styles.dropdown}
        options={['New', 'In Progress', 'Resolved']}
        dropdownStyle={styles.dropdownStyle}
        defaultValue={ticket.status}
        onSelect={(index, value) => {
          Storage.updateTicket({
            ...ticket,
            status: value,
          });
          setTickets(prevTickets => {
            return prevTickets.map(t => {
              if (ticket.id === t.id) {
                return { ...t, status: value };
              }
              return t;
            });
          });
        }}
      />
      <View style={styles.ticketStatus}>
        <Text>Name: {ticket.name}</Text>
        <Text>Email: {ticket.email}</Text>
        <Text>Description: {ticket.description}</Text>
        { !!ticket.picture &&
          <Image
            style={styles.picture}
            source={{ uri: ticket.picture }}
            resizeMode="contain"
          />
        }
      </View>
    </View>
  );
}

function AdminScreen() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const fetchTickets = async () => {
      const retrievedTickets = await Storage.getTickets();
      setTickets(prevTickets => retrievedTickets);
    };
    fetchTickets();
  }, []);

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>Support Tickets</Text>
      {tickets.map((ticket, index) => (
        <Ticket ticket={ticket} setTickets={setTickets} key={index}/>
      ))}
    </ScrollView>
  );
}

function HomeScreen() {
  const [ticket, setTicket] = useState({ name: '', email: '', description: '', picture: null });

  const handleChange = (id, text) => {
    setTicket(
      (ticket) => ({
        ...ticket,
        [id]: text,
      })
    )
  }

  const handlePickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library was denied');
      return;
    }
  
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
  
    if (result.cancelled) {
      alert('Image selection was cancelled');
      return;
    }
  
    console.log(`Picture was attached: ${JSON.stringify(result, null, 2)}`);
    setTicket(prevTicket => ({
      ...prevTicket,
      picture: !!result.assets ? result.assets[0]?.uri : null,
    }));
  };
  

  const alert = (message) => {
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert(message);
    }
  };

  const handleSubmit = () => {
    if (!ticket.name || !ticket.email || !ticket.description) {
      alert("Name, Email, and Description are required")
    } else {
      Storage.addTicket(ticket);
      alert("Your ticket has been submitted")
      setTicket({name: '', email: '', description: ''})
    }
  };

  return (
    <ScrollView style={styles.page}>
      <Text style={styles.title}>
        Create a Support Ticket
      </Text>
      <Text style={styles.header}>
        Name*
      </Text>
      <TextInput
        style={styles.input}
        value={ticket.name}
        onChangeText={text => handleChange("name", text)}
        placeholder="First Last"
        placeholderTextColor="grey"
      />
      <Text style={styles.header}>
        Email*
      </Text>
      <TextInput
        style={styles.input}
        value={ticket.email}
        onChangeText={text => handleChange("email", text)}
        placeholder="abc@gmail.com"
        placeholderTextColor="grey"
      />
      <Text style={styles.header}>
        Description*
      </Text>
      <TextInput
        style={styles.input}
        value={ticket.description}
        onChangeText={text => handleChange("description", text)}
        placeholder="What are you having trouble with"
        placeholderTextColor="grey"
        multiline={true}
        numberOfLines={4}
      />
      { !!ticket.picture &&
        <Image
          style={styles.picture}
          source={{ uri: ticket.picture }}
          resizeMode="contain"
        />
      }
      <View style={styles.button}>
        <Button title="Attach Picture" onPress={handlePickImage} />
      </View>

      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
  );
}

export default function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  const switchScreen = () => {
    setShowAdmin(() => !showAdmin);
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.navBar}>
        <View style={styles.navBarInner}>
          <Text style={styles.navHeader}>Zealthy</Text>
          <Button title={!showAdmin ? "Admin Panel" : "Support Ticket"} onPress={switchScreen} />
        </View>
      </SafeAreaView>
      { showAdmin ? <AdminScreen/> : <HomeScreen/>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBar: { 
    paddingTop:10,
    backgroundColor: 'black',
    alignItems: 'center',
    width: "100%",
  },
  navBarInner: {
    paddingHorizontal: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: "90%",
    maxWidth: 800,
  },
  navHeader: {
    color: "white",
    fontSize: 25,
  },
  page: {
    flex: 1, 
    width: "90%",
    maxWidth: 800,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    paddingVertical: 10,
  },
  header: {
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 8,
    borderRadius: 4,
    marginVertical: 2
  },
  picture: {
    width: 200,
    height: 150,
    resizeMode: 'contain',
    marginVertical: 10,
    alignSelf: 'center',
  },
  button: {
    marginVertical: 10,
    marginBottom: 10,
    marginTop: 10,
  },
  ticket: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    borderRadius: 4,
    marginVertical: 2,
  },
  ticketStatus: {
    flexDirection: "column",
    flex: 1,
  },
  dropdown: {
    width: 80,
    padding: 3,
    margin: 3,
    marginRight: 10,
  },
  dropdownStyle: {
    height: 100,
  },
});
