import { hashPassword } from "./server/auth";

async function testPassword() {
  const password = "admin123";
  const hashedPassword = await hashPassword(password);
  
  console.log(`Original password: ${password}`);
  console.log(`Hashed password: ${hashedPassword}`);
  
  // Example of pre-hashed password from storage.ts
  const storedHash = "c67fd35b5759b0a835fe4a0d40b7940cfabda9d3fcdc227365b3f5700ce5bdb4b1c500154aef9fe3fc1864d7cbf5fc2454d31c251bc16d7b81ee707e0211e75c.9d39402e87525f37f35c665f376ae410";
  
  console.log(`\nPre-stored hash: ${storedHash}`);
  console.log(`Newly generated hash: ${hashedPassword}`);
  
  console.log("\nNote: With SCRYPT, the same password will generate different hashes each time because of the random salt.");
}

testPassword().catch(console.error);