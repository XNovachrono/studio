

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const { path, operation, requestResourceData } = context;
    const message = `FirestoreError: Missing or insufficient permissions: 
The following request was denied by Firestore Security Rules:
${JSON.stringify({
  request: {
    path,
    method: operation,
    resource: {
      data: requestResourceData,
    },
  },
}, null, 2)}`;
    
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    
    // This is to make the error readable in the Next.js dev overlay
    this.stack = '';
  }
}
