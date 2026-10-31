from pathlib import Path
import hashlib,json,unittest
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
class ExportTests(unittest.TestCase):
    def test_store_sets_are_four_opaque_portrait_images(self):
        for device,size in [('iphone',(1320,2868)),('ipad',(2064,2752))]:
            paths=sorted((ROOT/'app-store/feature-images'/device).glob('*.png'))
            self.assertEqual(len(paths),4)
            self.assertEqual([p.name[:2] for p in paths],['01','02','03','04'])
            for p in paths:
                with Image.open(p) as image:
                    self.assertEqual(image.size,size)
                    self.assertEqual(image.mode,'RGB')
    def test_panels_are_adjacent_slices_of_one_wallpaper(self):
        source=ROOT/'app-store/design/generated/continuous-blue-raspberry.png'
        for device,(w,h) in [('iphone',(1320,2868)),('ipad',(2064,2752))]:
            master=Image.open(source).convert('RGB').resize((4*w,h),Image.Resampling.LANCZOS)
            for i,p in enumerate(sorted((ROOT/'app-store/feature-images'/device).glob('*.png'))):
                with Image.open(p) as panel:
                    for x in [0,w-1]:
                        self.assertEqual(panel.crop((x,0,x+1,h)).tobytes(),master.crop((i*w+x,0,i*w+x+1,h)).tobytes())
    def test_real_capture_provenance_and_crop_bounds(self):
        manifest=json.loads((ROOT/'app-store/design/capture-manifest.json').read_text())
        self.assertEqual(len(manifest),8)
        for item in manifest:
            p=ROOT/item['source']
            self.assertEqual(hashlib.sha256(p.read_bytes()).hexdigest(),item['sourceSha256'])
            with Image.open(p) as image:
                left,top,right,bottom=item['crop']
                self.assertTrue(0<=left<right<=image.width)
                self.assertTrue(0<=top<bottom<=image.height)
if __name__=='__main__':unittest.main()
