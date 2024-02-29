import AsyncStorage from '@react-native-async-storage/async-storage';


// LOCAL STORAGE OF TICEKTS
// tickets are id'd based on creation order
// these functions would need to be updated to integrate with a backend

const addTicket = async (ticket) => {
    try {
      const ticketsArray = await getTickets();
      ticket.id = ticketsArray.length;
      ticket.status = "New";
      ticketsArray.push(ticket);
      await AsyncStorage.setItem('tickets', JSON.stringify(ticketsArray));
      console.log('Ticket saved successfully:', ticket);
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
};

const getTickets = async () => {
    try {
        const existingTickets = await AsyncStorage.getItem('tickets');
        if (existingTickets !== null) {
            return JSON.parse(existingTickets);
        } else {
            console.log('No tickets found in AsyncStorage');
            return [];
        }
    } catch (error) {
        console.error('Error getting tickets:', error);
        return [];
    }
};

const updateTicket = async (updatedTicket) => {
    try {
        const ticketsArray = await getTickets();

        ticketsArray[updatedTicket.id] = updatedTicket;

        await AsyncStorage.setItem('tickets', JSON.stringify(ticketsArray));
        console.log('Ticket updated successfully:', updatedTicket);

        return ticketsArray;
    } catch (error) {
        console.error('Error updating ticket:', error);
    }
};

export default {
    addTicket,
    getTickets,
    updateTicket,
}