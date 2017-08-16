import {Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RegisterAuthService} from '../../services/register-auth.service';
import { Router } from '@angular/router';
import {CreateOrganizationComponent} from '../create-organization/create-organization.component';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css'],
  providers: []
})
export class CreateAccountComponent implements OnInit{

  form: FormGroup;
  message;
  messageClass;
  processing = false;
  emailValid;
  emailMessage;
  usernameValid;
  usernameMessage;
  organizations;
  isNewOrg;
  isAdmin;
  organizationToBeCreated;

  @ViewChild(CreateOrganizationComponent)
  private createOrganizationComponent: CreateOrganizationComponent;

  constructor(
    private formBuilder: FormBuilder,
    private authService: RegisterAuthService,
    private router: Router
  ) {
    this.createForm(); // Create Angular 2 Form when component loads
  }

  // Function to create registration form
  createForm() {
    this.form = this.formBuilder.group({
      // First Name Input
      firstname: ['', Validators.compose([
        Validators.required, // Field is required
        this.validateUsername // Custom validation
      ])],
      // Last Name Input
      lastname: ['', Validators.compose([
        Validators.required, // Field is required
        this.validateUsername // Custom validation
      ])],
      // Email Input
      email: ['', Validators.compose([
        Validators.required, // Field is required
        Validators.minLength(5), // Minimum length is 5 characters
        Validators.maxLength(30), // Maximum length is 30 characters
        this.validateEmail // Custom validation
      ])],
      // Username Input
      username: ['', Validators.compose([
        Validators.required, // Field is required
        Validators.minLength(3), // Minimum length is 3 characters
        Validators.maxLength(15), // Maximum length is 15 characters
        this.validateUsername // Custom validation
      ])],
      // Password Input
      password: ['', Validators.compose([
        Validators.required, // Field is required
        Validators.minLength(7), // Minimum length is 8 characters
        Validators.maxLength(35), // Maximum length is 35 characters
        this.validatePassword // Custom validation
      ])],
      // Confirm Password Input
      confirm: ['', Validators.required], // Field is required
      organization : ['', Validators.required]
    }, { validator: this.matchingPasswords('password', 'confirm') }); // Add custom validator to form for matching passwords

  }

  // Function to disable the registration form
  disableForm() {
    this.form.controls['firstname'].disable();
    this.form.controls['lastname'].disable();
    this.form.controls['email'].disable();
    this.form.controls['username'].disable();
    this.form.controls['password'].disable();
    this.form.controls['confirm'].disable();
    this.form.controls['organization'].disable();
  }

  // Function to enable the registration form
  enableForm() {
    this.form.controls['firstname'].enable();
    this.form.controls['lastname'].enable();
    this.form.controls['email'].enable();
    this.form.controls['username'].enable();
    this.form.controls['password'].enable();
    this.form.controls['confirm'].enable();
    this.form.controls['organization'].enable();
  }

  // Function to validate e-mail is proper format
  validateEmail(controls) {
    // Create a regular expression
    const regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    // Test email against regular expression
    if (regExp.test(controls.value)) {
      return null; // Return as valid email
    } else {
      return { 'validateEmail': true } // Return as invalid email
    }
  }

  // Function to validate username is proper format
  validateUsername(controls) {
    // Create a regular expression
    const regExp = new RegExp(/^[a-zA-Z0-9]+$/);
    // Test username against regular expression
    if (regExp.test(controls.value)) {
      return null; // Return as valid username
    } else {
      return { 'validateUsername': true } // Return as invalid username
    }
  }

  // Function to validate password
  validatePassword(controls) {
    // Create a regular expression
    const regExp = new RegExp(/^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?[\d])(?=.*?[\W]).{8,35}$/);
    // Test password against regular expression
    if (regExp.test(controls.value)) {
      return null; // Return as valid password
    } else {
      return { 'validatePassword': true } // Return as invalid password
    }
  }

  // Funciton to ensure passwords match
  matchingPasswords(password, confirm) {
    return (group: FormGroup) => {
      // Check if both fields are the same
      if (group.controls[password].value === group.controls[confirm].value) {
        return null; // Return as a match
      } else {
        return { 'matchingPasswords': true } // Return as error: do not match
      }
    }
  }

  // Function to submit form
  onRegisterSubmit() {
    this.processing = true; // Used to notify HTML that form is in processing, so that it can be disabled
    this.disableForm(); // Disable the form
    // Create user object form user's inputs
    if (this.isNewOrg) {
      this.isAdmin = true;
    } else {
      this.isAdmin = false;
    }

    const organName = (this.createOrganizationComponent.form.controls['organizationname'].value);
    const organLoc = (this.createOrganizationComponent.form.controls['location'].value);
    console.log(organName);
    console.log(organLoc);
    if (organName != null && organLoc != null) {
      const organization = {
        organizationname : organName,
        location : organLoc
      }

      this.authService.createOrganization(organization).subscribe(data => {
        if (data.success) {
          this.messageClass = 'alert alert-success'; // Set a success class
          this.message = data.message; // Set a success messagers
          this.organizationToBeCreated = data.organization.organizationname;

          const user = {
            firstname: this.form.get('firstname').value, // E-mail input field
            lastname: this.form.get('lastname').value, // E-mail input field
            email: this.form.get('email').value, // E-mail input field
            username: this.form.get('username').value, // Username input field
            password: this.form.get('password').value, // Password input field
            role: this.isAdmin, //user/admin?
            organization : this.organizationToBeCreated //new organization
          };
          console.log(user);

          // Function from authentication service to register user
          this.authService.registerUser(user).subscribe(data => {
            // Resposne from registration attempt
            if (!data.success) {
              this.messageClass = 'alert alert-danger'; // Set an error class
              this.message = data.message; // Set an error message
              this.processing = false; // Re-enable submit button
              this.enableForm(); // Re-enable form
            } else {
              this.messageClass = 'alert alert-success'; // Set a success class
              this.message = data.message; // Set a success message
              // After 2 second timeout, navigate to the login page
              setTimeout(() => {
                this.router.navigate(['']); // Redirect to login view
              }, 2000);
            }
          });

        } else {
          if (!data.success) {
            this.messageClass = 'alert alert-danger'; // Set an error class
            this.message = data.message; // Set an error message
            this.processing = false; // Re-enable submit button
            this.enableForm(); // Re-enable form
          }
        }
      });
    } else {
      const user = {
        firstname: this.form.get('firstname').value, // E-mail input field
        lastname: this.form.get('lastname').value, // E-mail input field
        email: this.form.get('email').value, // E-mail input field
        username: this.form.get('username').value, // Username input field
        password: this.form.get('password').value, // Password input field
        role: this.isAdmin, //user/admin?
        organization : this.form.get('organization').value //new organization
      };

      console.log(user);

      // Function from authentication service to register user
      this.authService.registerUser(user).subscribe(data => {
        // Resposne from registration attempt
        if (!data.success) {
          this.messageClass = 'alert alert-danger'; // Set an error class
          this.message = data.message; // Set an error message
          this.processing = false; // Re-enable submit button
          this.enableForm(); // Re-enable form
        } else {
          this.messageClass = 'alert alert-success'; // Set a success class
          this.message = data.message; // Set a success message
          // After 2 second timeout, navigate to the login page
          setTimeout(() => {
            this.router.navigate(['']); // Redirect to login view
          }, 20000);
        }
      });
    }

  }

  // Function to check if e-mail is taken
  checkEmail() {
    // Function from authentication file to check if e-mail is taken
    this.authService.checkEmail(this.form.get('email').value).subscribe(data => {
      // Check if success true or false was returned from API
      if (!data.success) {
        this.emailValid = false; // Return email as invalid
        this.emailMessage = data.message; // Return error message
      } else {
        this.emailValid = true; // Return email as valid
        this.emailMessage = data.message; // Return success message
      }
    });
  }

  // Function to check if username is available
  checkUsername() {
    // Function from authentication file to check if username is taken
    this.authService.checkUsername(this.form.get('username').value).subscribe(data => {
      // Check if success true or success false was returned from API
      if (!data.success) {
        this. usernameValid = false; // Return username as invalid
        this.usernameMessage = data.message; // Return error message
      } else {
        this.usernameValid = true; // Return username as valid
        this.usernameMessage = data.message; // Return success message
      }
    });
  }

  generateOrgans() {
    this.authService.getOrganizations().subscribe(data => {
      // Check if success true or success false was returned from API
      if (!data.success) {
        this.messageClass = 'alert alert-danger'; // Set an error class
        this.message = data.message; // Set an error message
        // this.processing = false; // Re-enable submit button
      } else {
        this.organizations = data.organList;
      }
    });
  }


  toggleNewOrganization() {
    if (this.form.controls['organization'].value === 'New') {
      this.isNewOrg = true;
    } else {
      this.isNewOrg =false;
    }
  }

  ngOnInit() {
    this.authService.createRegisterToken().subscribe(data => {
      this.authService.storeUserData(data.token);
      this.generateOrgans();
    });
  }

}
