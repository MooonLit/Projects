<template>
  <main>
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Create Service
    </h1>
    <div class="px-10 py-20">
      <form @submit.prevent="handleSubmitForm">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <div class="flex flex-col col-span-full">
            <label class="block">
              <span class="text-gray-700">Service Name</span><span style="color: #ff0000">*</span>
              <input type="text" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="service.name" />
            </label>
          </div>
          <div class="flex flex-col col-span-full">
            <label>
              <span class="text-gray-700">Description</span>
              <textarea class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        v-model="service.description"></textarea>
            </label>
          </div>
          <div class="flex flex-col col-span-full">
            <label>
              <span class="text-gray-700">Status</span>
              <select v-model="service.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
          </div>
          <div class="flex justify-center col-span-full mt-5">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Service</button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<script>
import { reactive } from 'vue'; // Import reactive to create a reactive object for form state
import { useVuelidate } from '@vuelidate/core'; // Import useVuelidate for form validation
import { required } from '@vuelidate/validators'; // Import required validator
import { createService } from '@/api/api'; // Import API function to create a service
import { useToast } from 'vue-toastification'; // Import toast notifications for user feedback

export default {
  setup() {
    // Define the reactive state for the service form
    const service = reactive({
      name: '',
      description: '',
      status: 'active' // Default status set to 'active'
    });

    // Define validation rules for the service form
    const rules = {
      name: { required }, // Name is required
      description: {}, // Description is optional
      status: { required } // Status is required
    };

    // Initialize Vuelidate with the defined rules and service data
    const v$ = useVuelidate(rules, service);
    const toast = useToast(); // Initialize toast notifications

    // Define the function to handle form submission
    const handleSubmitForm = async () => {
      await v$.value.$validate(); // Trigger form validation
      if (!v$.value.$error) { // Check if there are no validation errors
        console.log('Sending service data:', service); // Log service data being sent (for debugging)
        try {
          const response = await createService(service); // Call API to create the service
          console.log('Service creation successful:', response); // Log successful creation response (for debugging)
          toast.success('Service created successfully!'); // Show success toast
          // Reset the form fields after successful creation
          service.name = '';
          service.description = '';
          service.status = 'active';
        } catch (error) {
          console.error('Error during service creation:', error); // Log error details
          // Display error toast with specific message or a fallback generic message
          toast.error('Error creating service: ' + (error.message || 'Unknown error'));
        }
      } else {
        console.warn('Validation errors:', v$.value.$errors); // Log validation errors (for debugging)
        toast.error('Please correct the form errors.'); // Display toast prompting correction of form errors
      }
    };

    // Return reactive data and methods to be used in the component
    return {service, handleSubmitForm, v$};
  }
};
</script>

