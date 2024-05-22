import { Firestore } from 'firebase/firestore';

declare const db: Firestore;
declare function addDoc(collection: any, data: any): Promise<any>;
declare function collection(db: Firestore, collectionName: string): any;
declare function doc(db: Firestore, docPath: string): any;
declare function setDoc(doc: any, data: any): Promise<void>;
declare function getDoc(doc: any): Promise<any>;

export { db, addDoc, collection, doc, setDoc, getDoc };
