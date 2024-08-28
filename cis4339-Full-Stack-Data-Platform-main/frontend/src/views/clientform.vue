<!-- This view allows a user to create client information. -->

<template>
  <main>
    <!--Header-->
    <h1 class="font-bold text-4xl text-red-700 tracking-widest text-center mt-10">
      Client Intake Form
    </h1>
    <div class="px-10 py-20">
      <!-- form field -->
      <!-- @submit.prevent stops the submit event from reloading the page-->
      <form @submit.prevent="submitForm">
        <!-- grid container -->
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Personal Details</h2>
          <!--First Name Input Field-->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">First Name</span>
              <span style="color: #ff0000">*</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="client.firstName"/>
            </label>
          </div>

          <!--Middle Name Input Field-->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Middle Name</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     placeholder v-model="client.middleName"/>
            </label>
          </div>

          <!--Last Name Input Field-->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Last Name</span>
              <span style="color: #ff0000">*</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     placeholder v-model="client.lastName"/>
            </label>
          </div>

          <div></div>
          <!--Email Input Field-->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Email</span>
              <span style="color: #ff0000">*</span>
              <input type="email"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="client.email"/>
            </label>
          </div>
          <!-- Phone Number Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Phone Number</span>
              <span style="color: #ff0000">*</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     pattern="[0-9]{3}[0-9]{3}[0-9]{4}" v-model="client.phoneNumber.primary"/>
            </label>

          </div>

          <!-- Alternative Phone Number Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Alternative Phone Number</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     pattern="[0-9]{3}[0-9]{3}[0-9]{4}" v-model="client.phoneNumber.alternate"/>
            </label>
          </div>
        </div>

        <!-- grid container -->
        <div class="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          <h2 class="text-2xl font-bold">Address Details</h2>
          <!-- Address 1 Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Address Line 1</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="client.address.line1"/>
            </label>
          </div>

          <!-- Address 2 Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Address Line 2</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="client.address.line2"/>
            </label>
          </div>

          <!-- City Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">City</span>
              <span style="color: #ff0000">*</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="client.address.city"/>
            </label>
          </div>
          <div></div>

          <!-- County Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">County</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="client.address.county"/>
            </label>
          </div>

          <!-- Zip Code Input Field -->
          <div class="flex flex-col">
            <label class="block">
              <span class="text-gray-700">Zip Code</span>
              <input type="text"
                     class="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                     v-model="client.address.zip"/>
            </label>
          </div>
          <div></div>

          <!-- Add Client Submit Button -->
          <div class="flex justify-between mt-10 mr-20">
            <button class="bg-red-700 text-white rounded" type="submit">
              Add Client
            </button>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>


<script>
// Import necessary Vue Composition API functions
import {ref, reactive} from "vue";
import useVuelidate from "@vuelidate/core"; // Import Vuelidate for form validation
import {required, minLength, maxLength, numeric, email} from "@vuelidate/validators"; // Import specific validators
import {createClient} from "@/api/api"; // Import the API call to create a client
import {useToast} from "vue-toastification"; // Import the toast library for notifications
import router from "@/router"; // Import the router to navigate after actions

export default {
  setup() {
    const toast = useToast(); // Initialize toast notifications
    // Define the reactive state for the client's form data
    const client = reactive({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNumber: {
        primary: '',
        alternate: ''
      },
      address: {
        line1: '',
        line2: '',
        city: '',
        county: '',
        zip: ''
      },
    });

    // Define validation rules for the client form
    const rules = {
      firstName: {required}, // First name is required
      lastName: {required}, // Last name is required
      email: {required, email}, // Email is required and must be a valid email format
      phoneNumber: {
        primary: {required, numeric, minLength: minLength(10), maxLength: maxLength(10)},
        // Primary phone number is required, must be numeric, and exactly 10 digits long
      },
      address: {
        city: {required}, // City is required in the address
      }
    };

    // Initialize Vuelidate with the defined rules and client data
    const v$ = useVuelidate(rules, client);

    // Define the function to submit the form
    const submitForm = async () => {
      await v$.value.$validate(); // Trigger validation
      if (!v$.value.$invalid) { // Check if the form is valid
        try {
          await createClient(client); // Call the API to create the client
          toast.success("Client added successfully!"); // Show success message
          await router.push('/findclient'); // navigate to another route or perform further actions
        } catch (error) {
          console.error("Error creating client:", error); // Log any errors
          toast.error("Error creating client: " + (error.message || "Unknown error")); // Show error message
        }
      } else {
        toast.error("Please correct the errors in the form."); // Notify user to correct form errors
      }
    };

    // Return the client data, validation state, and form submission function
    return {client, v$, submitForm};
  }
};
</script>



