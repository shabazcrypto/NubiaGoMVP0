const fs = require('fs');
const path = require('path');

// Files that need toast.success fixes
const toastFiles = [
  'src/components/ui/address-validation.tsx',
  'src/components/shipping/tracking-widget.tsx',
  'src/components/shipping/shipping-calculator.tsx',
  'src/components/shipping/label-generator.tsx',
  'src/components/payment/mobile-money-form.tsx',
  'src/components/payment/credit-card-form.tsx',
  'src/lib/__tests__/utils.test.ts'
];

// Files that need button size fixes
const buttonFiles = [
  'src/components/cart/CartDrawer.tsx',
  'src/components/navigation/MainNav.tsx',
  'src/components/product/ProductCard.tsx'
];

// Files that need image upload fixes
const imageUploadFiles = [
  'src/components/supplier/supplier-image-upload.tsx',
  'src/components/ui/image-upload.tsx',
  'src/app/(dashboard)/customer/profile/page.tsx'
];

function fixToastIssues() {
  console.log('🔧 Fixing toast issues...');
  
  toastFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix toast.success calls
      content = content.replace(
        /toast\.success\(([^,]+),\s*([^)]+)\)/g,
        'toast($2, "success")'
      );
      
      // Fix toast.error calls
      content = content.replace(
        /toast\.error\(([^,]+),\s*([^)]+)\)/g,
        'toast($2, "error")'
      );
      
      // Fix single parameter toast.success
      content = content.replace(
        /toast\.success\(([^)]+)\)/g,
        'toast($1, "success")'
      );
      
      // Fix single parameter toast.error
      content = content.replace(
        /toast\.error\(([^)]+)\)/g,
        'toast($1, "error")'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed toast issues in ${filePath}`);
    }
  });
}

function fixButtonIssues() {
  console.log('🔧 Fixing button size issues...');
  
  buttonFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace size="icon" with className
      content = content.replace(
        /size="icon"/g,
        'className="h-8 w-8 p-0"'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed button issues in ${filePath}`);
    }
  });
}

function fixImageUploadIssues() {
  console.log('🔧 Fixing image upload issues...');
  
  imageUploadFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace onUploadError with onError
      content = content.replace(/onUploadError/g, 'onError');
      
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed image upload issues in ${filePath}`);
    }
  });
}

// Run all fixes
console.log('🚀 Starting deployment fixes...\n');

fixToastIssues();
fixButtonIssues();
fixImageUploadIssues();

console.log('\n✅ All deployment fixes completed!');
console.log('📝 Next steps:');
console.log('1. Review the changes');
console.log('2. Commit and push to GitHub');
console.log('3. Deploy to Vercel');
